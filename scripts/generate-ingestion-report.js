/**
 * Generate Comprehensive Ingestion Report
 * 
 * This script analyzes the Excel file and generates a detailed report showing:
 * - Total rows read
 * - Unique centres detected (with uniqueness definition)
 * - Skip reasons breakdown
 * - Data quality issues
 */

const XLSX = require('xlsx');
const path = require('path');
const { normalizeSubject } = require('./subject-normalization');

// ============================================================================
// PARSING LOGIC (reused from ingestion)
// ============================================================================

function parseLevelRange(rangeStr) {
  const levels = [];
  
  if (rangeStr === 'UNKNOWN') {
    return ['UNKNOWN'];
  }
  
  const rangeMatch = rangeStr.match(/^([A-Za-z]+)(\d+)-([A-Za-z]+)?(\d+)$/);
  if (rangeMatch) {
    const [, prefix1, start, , end] = rangeMatch;
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    
    for (let i = startNum; i <= endNum; i++) {
      levels.push(formatLevel(prefix1, i));
    }
    return levels;
  }
  
  if (rangeStr.includes('/')) {
    const parts = rangeStr.split('/');
    parts.forEach(part => {
      const match = part.match(/^([A-Za-z]+)(\d+)$/);
      if (match) {
        const [, prefix, num] = match;
        levels.push(formatLevel(prefix, parseInt(num)));
      }
    });
    return levels;
  }
  
  const singleMatch = rangeStr.match(/^([A-Za-z]+)(\d+)$/);
  if (singleMatch) {
    const [, prefix, num] = singleMatch;
    levels.push(formatLevel(prefix, parseInt(num)));
    return levels;
  }
  
  return ['UNKNOWN'];
}

function formatLevel(prefix, number) {
  const prefixMap = {
    'P': 'Primary',
    'Sec': 'Secondary',
    'J': 'JC'
  };
  
  const fullPrefix = prefixMap[prefix] || prefix;
  return `${fullPrefix} ${number}`;
}

function parseSubjectLevelString(encodedStr) {
  if (!encodedStr || encodedStr.trim() === '') {
    return [];
  }
  
  const entries = [];
  const subjects = encodedStr.split(';').map(s => s.trim()).filter(s => s);
  
  subjects.forEach(subjectEntry => {
    const [subjectName, levelRange] = subjectEntry.split('|').map(s => s.trim());
    
    if (!subjectName) return;
    
    const levels = levelRange ? parseLevelRange(levelRange) : ['UNKNOWN'];
    
    entries.push({
      rawSubject: subjectName,
      levels: levels
    });
  });
  
  return entries;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

async function generateReport() {
  try {
    console.log('='.repeat(80));
    console.log('COMPREHENSIVE INGESTION REPORT');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Read Excel file
    const filePath = path.join(process.cwd(), 'Offerings_MarineParade_Encoded.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📖 Total rows read from Excel: ${data.length}\n`);
    
    // Track statistics
    const stats = {
      totalRows: data.length,
      uniqueCentres: new Set(),
      uniqueCentresByNameAndAddress: new Set(),
      processedCentres: [],
      skipReasons: {
        missingName: [],
        flaggedForReview: [],
        unknownLevels: [],
        invalidSubjects: [],
        noValidSubjects: [],
        duplicateName: []
      },
      dataQualityIssues: {
        unknownLevels: [],
        messySubjects: [],
        missingWebsite: [],
        needsReview: []
      }
    };
    
    // Process each row
    data.forEach((row, index) => {
      const rowNum = index + 2; // Excel row (1-indexed + header)
      const centreName = row.centre_name?.trim();
      const sourceUrl = row.source_url?.trim();
      const needsReview = row.needs_review === true || row.needs_review === 'true' || row.needs_review === 1;
      const notes = row.notes?.trim();
      
      // Check for missing name
      if (!centreName) {
        stats.skipReasons.missingName.push({
          row: rowNum,
          data: row
        });
        return;
      }
      
      // Track uniqueness
      const nameKey = centreName.toLowerCase();
      const nameAddressKey = `${centreName.toLowerCase()}|${sourceUrl || 'no-url'}`;
      
      if (stats.uniqueCentres.has(nameKey)) {
        stats.skipReasons.duplicateName.push({
          row: rowNum,
          name: centreName,
          url: sourceUrl
        });
      }
      
      stats.uniqueCentres.add(nameKey);
      stats.uniqueCentresByNameAndAddress.add(nameAddressKey);
      
      // Parse all subject-level combinations
      const primaryEntries = parseSubjectLevelString(row.primary_subjects_fmt);
      const secondaryEntries = parseSubjectLevelString(row.secondary_subjects_fmt);
      const jcH1Entries = parseSubjectLevelString(row.jc_h1_subjects_fmt);
      const jcH2Entries = parseSubjectLevelString(row.jc_h2_subjects_fmt);
      const jcUnknownEntries = parseSubjectLevelString(row.jc_unknown_subjects_fmt);
      
      const allEntries = [
        ...primaryEntries,
        ...secondaryEntries,
        ...jcH1Entries,
        ...jcH2Entries,
        ...jcUnknownEntries
      ];
      
      // Analyze subjects and levels
      const subjectLevelPairs = [];
      let hasUnknownLevels = false;
      let hasInvalidSubjects = false;
      let validSubjectCount = 0;
      let invalidSubjectCount = 0;
      const invalidSubjects = [];
      
      for (const entry of allEntries) {
        const canonicalSubject = normalizeSubject(entry.rawSubject);
        
        if (!canonicalSubject) {
          hasInvalidSubjects = true;
          invalidSubjectCount++;
          invalidSubjects.push(entry.rawSubject);
          continue;
        }
        
        validSubjectCount++;
        
        for (const level of entry.levels) {
          if (level === 'UNKNOWN') {
            hasUnknownLevels = true;
          } else {
            subjectLevelPairs.push({
              subject: canonicalSubject,
              level: level
            });
          }
        }
      }
      
      // Get unique subjects and levels
      const centreSubjects = [...new Set(subjectLevelPairs.map(p => p.subject))];
      const centreLevels = [...new Set(subjectLevelPairs.map(p => p.level))];
      
      // Determine if this centre would be skipped by current logic
      let wouldBeSkipped = false;
      let skipReason = null;
      
      if (needsReview) {
        wouldBeSkipped = true;
        skipReason = 'flaggedForReview';
        stats.skipReasons.flaggedForReview.push({
          row: rowNum,
          name: centreName,
          notes: notes
        });
      }
      
      if (centreSubjects.length === 0) {
        wouldBeSkipped = true;
        skipReason = 'noValidSubjects';
        stats.skipReasons.noValidSubjects.push({
          row: rowNum,
          name: centreName,
          invalidSubjects: invalidSubjects
        });
      }
      
      // Track data quality issues
      if (hasUnknownLevels) {
        stats.dataQualityIssues.unknownLevels.push({
          row: rowNum,
          name: centreName
        });
      }
      
      if (hasInvalidSubjects) {
        stats.dataQualityIssues.messySubjects.push({
          row: rowNum,
          name: centreName,
          invalidSubjects: invalidSubjects
        });
      }
      
      if (!sourceUrl) {
        stats.dataQualityIssues.missingWebsite.push({
          row: rowNum,
          name: centreName
        });
      }
      
      if (needsReview) {
        stats.dataQualityIssues.needsReview.push({
          row: rowNum,
          name: centreName,
          notes: notes
        });
      }
      
      // Store processed centre info
      stats.processedCentres.push({
        row: rowNum,
        name: centreName,
        url: sourceUrl,
        subjects: centreSubjects,
        levels: centreLevels,
        hasUnknownLevels,
        hasInvalidSubjects,
        invalidSubjects,
        validSubjectCount,
        invalidSubjectCount,
        needsReview,
        notes,
        wouldBeSkipped,
        skipReason
      });
    });
    
    // ========================================================================
    // PRINT REPORT
    // ========================================================================
    
    console.log('📊 INGESTION STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total rows read from Excel:              ${stats.totalRows}`);
    console.log(`\nUniqueness Definition:`);
    console.log(`  - By name only:                        ${stats.uniqueCentres.size} unique centres`);
    console.log(`  - By name + URL:                       ${stats.uniqueCentresByNameAndAddress.size} unique centres`);
    console.log(`\nCurrent Ingestion Logic:`);
    
    const wouldBeInserted = stats.processedCentres.filter(c => !c.wouldBeSkipped).length;
    const wouldBeSkipped = stats.processedCentres.filter(c => c.wouldBeSkipped).length;
    
    console.log(`  ✅ Centres that would be inserted:     ${wouldBeInserted}`);
    console.log(`  ⏭️  Centres that would be skipped:      ${wouldBeSkipped}`);
    console.log('\n');
    
    // Skip reasons breakdown
    console.log('⏭️  SKIP REASONS BREAKDOWN');
    console.log('='.repeat(80));
    console.log(`Missing centre name:                     ${stats.skipReasons.missingName.length}`);
    console.log(`Flagged for review:                      ${stats.skipReasons.flaggedForReview.length}`);
    console.log(`No valid subjects after normalization:   ${stats.skipReasons.noValidSubjects.length}`);
    console.log(`Duplicate centre name:                   ${stats.skipReasons.duplicateName.length}`);
    console.log('\n');
    
    // Data quality issues
    console.log('⚠️  DATA QUALITY ISSUES');
    console.log('='.repeat(80));
    console.log(`Centres with UNKNOWN levels:             ${stats.dataQualityIssues.unknownLevels.length}`);
    console.log(`Centres with invalid/messy subjects:     ${stats.dataQualityIssues.messySubjects.length}`);
    console.log(`Centres missing website:                 ${stats.dataQualityIssues.missingWebsite.length}`);
    console.log(`Centres marked needs_review:             ${stats.dataQualityIssues.needsReview.length}`);
    console.log('\n');
    
    // Detailed skip reasons
    if (stats.skipReasons.flaggedForReview.length > 0) {
      console.log('🚩 CENTRES FLAGGED FOR REVIEW (Would be skipped)');
      console.log('-'.repeat(80));
      stats.skipReasons.flaggedForReview.forEach(item => {
        console.log(`  Row ${item.row}: ${item.name}`);
        if (item.notes) {
          console.log(`    Notes: ${item.notes}`);
        }
      });
      console.log('\n');
    }
    
    if (stats.skipReasons.noValidSubjects.length > 0) {
      console.log('❌ CENTRES WITH NO VALID SUBJECTS (Would be skipped)');
      console.log('-'.repeat(80));
      stats.skipReasons.noValidSubjects.forEach(item => {
        console.log(`  Row ${item.row}: ${item.name}`);
        console.log(`    Invalid subjects: ${item.invalidSubjects.join(', ')}`);
      });
      console.log('\n');
    }
    
    if (stats.skipReasons.duplicateName.length > 0) {
      console.log('🔄 DUPLICATE CENTRE NAMES');
      console.log('-'.repeat(80));
      stats.skipReasons.duplicateName.forEach(item => {
        console.log(`  Row ${item.row}: ${item.name}`);
        console.log(`    URL: ${item.url || 'N/A'}`);
      });
      console.log('\n');
    }
    
    // Data quality details
    if (stats.dataQualityIssues.unknownLevels.length > 0) {
      console.log('⚠️  CENTRES WITH UNKNOWN LEVELS (Would be inserted but levels dropped)');
      console.log('-'.repeat(80));
      stats.dataQualityIssues.unknownLevels.slice(0, 10).forEach(item => {
        console.log(`  Row ${item.row}: ${item.name}`);
      });
      if (stats.dataQualityIssues.unknownLevels.length > 10) {
        console.log(`  ... and ${stats.dataQualityIssues.unknownLevels.length - 10} more`);
      }
      console.log('\n');
    }
    
    if (stats.dataQualityIssues.messySubjects.length > 0) {
      console.log('⚠️  CENTRES WITH INVALID/MESSY SUBJECTS (Subjects filtered out)');
      console.log('-'.repeat(80));
      stats.dataQualityIssues.messySubjects.slice(0, 10).forEach(item => {
        console.log(`  Row ${item.row}: ${item.name}`);
        console.log(`    Invalid: ${item.invalidSubjects.join(', ')}`);
      });
      if (stats.dataQualityIssues.messySubjects.length > 10) {
        console.log(`  ... and ${stats.dataQualityIssues.messySubjects.length - 10} more`);
      }
      console.log('\n');
    }
    
    // Sample of centres that would be inserted
    console.log('✅ SAMPLE CENTRES THAT WOULD BE INSERTED (First 10)');
    console.log('='.repeat(80));
    const toInsert = stats.processedCentres.filter(c => !c.wouldBeSkipped).slice(0, 10);
    toInsert.forEach(centre => {
      console.log(`\nRow ${centre.row}: ${centre.name}`);
      console.log(`  Subjects: ${centre.subjects.length} (${centre.subjects.slice(0, 3).join(', ')}${centre.subjects.length > 3 ? '...' : ''})`);
      console.log(`  Levels: ${centre.levels.length} (${centre.levels.slice(0, 3).join(', ')}${centre.levels.length > 3 ? '...' : ''})`);
      if (centre.hasUnknownLevels) {
        console.log(`  ⚠️  Has UNKNOWN levels (would be dropped)`);
      }
      if (centre.hasInvalidSubjects) {
        console.log(`  ⚠️  Has invalid subjects: ${centre.invalidSubjects.join(', ')}`);
      }
    });
    console.log('\n');
    
    // Recommendation
    console.log('='.repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(80));
    console.log(`\n1. Current importer IS skipping ${wouldBeSkipped} centres due to:`);
    console.log(`   - Flagged for review: ${stats.skipReasons.flaggedForReview.length}`);
    console.log(`   - No valid subjects: ${stats.skipReasons.noValidSubjects.length}`);
    console.log(`\n2. To insert ALL centres, we should:`);
    console.log(`   - Add dataQualityStatus field (OK / NEEDS_REVIEW)`);
    console.log(`   - Add dataQualityNotes field`);
    console.log(`   - Insert centres even with UNKNOWN levels or messy subjects`);
    console.log(`   - Flag them for review but don't block insertion`);
    console.log(`\n3. Expected result after policy change:`);
    console.log(`   - ${stats.uniqueCentres.size} centres would be inserted`);
    console.log(`   - ${stats.dataQualityIssues.needsReview.length + stats.dataQualityIssues.unknownLevels.length + stats.dataQualityIssues.messySubjects.length} would be flagged for review`);
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateReport();
