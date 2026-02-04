/**
 * Enhanced Tuition Centre Data Ingestion Script
 * 
 * NEW POLICY: Insert ALL centres with data quality flags
 * - No longer skip centres flagged for review
 * - No longer skip centres with UNKNOWN levels or messy subjects
 * - Store data quality status and notes for later review
 * - Comprehensive reporting with hard counts
 */

const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { normalizeSubject, getCanonicalSubjects } = require('./subject-normalization');

const prisma = new PrismaClient();

// ============================================================================
// PARSING LOGIC
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
// INGESTION LOGIC
// ============================================================================

async function ingestAllCentres() {
  const report = {
    totalRows: 0,
    uniqueCentres: 0,
    centresCreated: 0,
    centresSkipped: 0,
    centresFailed: 0,
    skipReasons: {
      missingName: 0,
      duplicateName: 0,
      dbError: 0
    },
    qualityFlags: {
      needsReview: 0,
      unknownLevels: 0,
      invalidSubjects: 0,
      noValidSubjects: 0,
      missingWebsite: 0
    },
    errors: []
  };
  
  try {
    console.log('='.repeat(80));
    console.log('ENHANCED TUITION CENTRE DATA INGESTION');
    console.log('NEW POLICY: Insert ALL centres with quality flags');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Read Excel file
    const filePath = path.join(process.cwd(), 'Offerings_MarineParade_Encoded.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    report.totalRows = data.length;
    console.log(`📖 Read ${data.length} rows from Excel\n`);
    
    // ========================================================================
    // STEP 1: Create all unique subjects
    // ========================================================================
    
    console.log('📚 STEP 1: Creating canonical subjects...');
    const canonicalSubjects = getCanonicalSubjects();
    const subjectMap = new Map();
    
    for (const subjectName of canonicalSubjects) {
      const subject = await prisma.subject.upsert({
        where: { name: subjectName },
        update: {},
        create: { name: subjectName }
      });
      subjectMap.set(subjectName, subject.id);
    }
    
    console.log(`   ✓ Created/verified ${subjectMap.size} subjects\n`);
    
    // ========================================================================
    // STEP 2: Create all unique levels
    // ========================================================================
    
    console.log('🎓 STEP 2: Creating levels...');
    const levelNames = [
      'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
      'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4',
      'JC 1', 'JC 2'
    ];
    
    const levelMap = new Map();
    
    for (const levelName of levelNames) {
      const level = await prisma.level.upsert({
        where: { name: levelName },
        update: {},
        create: { name: levelName }
      });
      levelMap.set(levelName, level.id);
    }
    
    console.log(`   ✓ Created/verified ${levelMap.size} levels\n`);
    
    // ========================================================================
    // STEP 3: Process and insert ALL tuition centres
    // ========================================================================
    
    console.log('🏫 STEP 3: Inserting ALL tuition centres...\n');
    
    const seenNames = new Set();
    
    for (const row of data) {
      const rowNum = data.indexOf(row) + 2; // Excel row number
      const centreName = row.centre_name?.trim();
      const sourceUrl = row.source_url?.trim();
      const needsReview = row.needs_review === true || row.needs_review === 'true' || row.needs_review === 1;
      const notes = row.notes?.trim();
      
      // Skip only if missing name
      if (!centreName) {
        console.log(`   ⏭️  [Row ${rowNum}] Skipping: no centre name`);
        report.centresSkipped++;
        report.skipReasons.missingName++;
        continue;
      }
      
      // Check for duplicate names (skip duplicates)
      const nameKey = centreName.toLowerCase();
      if (seenNames.has(nameKey)) {
        console.log(`   ⏭️  [Row ${rowNum}] Skipping duplicate: ${centreName}`);
        report.centresSkipped++;
        report.skipReasons.duplicateName++;
        continue;
      }
      seenNames.add(nameKey);
      report.uniqueCentres++;
      
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
      
      // Analyze data quality
      const qualityIssues = [];
      const subjectLevelPairs = [];
      let hasUnknownLevels = false;
      let invalidSubjects = [];
      
      for (const entry of allEntries) {
        const canonicalSubject = normalizeSubject(entry.rawSubject);
        
        if (!canonicalSubject) {
          invalidSubjects.push(entry.rawSubject);
          continue;
        }
        
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
      
      // Build quality status and notes
      let dataQualityStatus = 'OK';
      
      if (needsReview) {
        qualityIssues.push('Flagged for review in source data');
        dataQualityStatus = 'NEEDS_REVIEW';
        report.qualityFlags.needsReview++;
      }
      
      if (hasUnknownLevels) {
        qualityIssues.push('Contains UNKNOWN level ranges');
        dataQualityStatus = 'NEEDS_REVIEW';
        report.qualityFlags.unknownLevels++;
      }
      
      if (invalidSubjects.length > 0) {
        qualityIssues.push(`Invalid subjects filtered: ${invalidSubjects.join(', ')}`);
        dataQualityStatus = 'NEEDS_REVIEW';
        report.qualityFlags.invalidSubjects++;
      }
      
      if (subjectLevelPairs.length === 0) {
        qualityIssues.push('No valid subject-level pairs after normalization');
        dataQualityStatus = 'NEEDS_REVIEW';
        report.qualityFlags.noValidSubjects++;
      }
      
      if (!sourceUrl) {
        qualityIssues.push('Missing website URL');
        report.qualityFlags.missingWebsite++;
      }
      
      if (notes) {
        qualityIssues.push(`Original notes: ${notes}`);
      }
      
      const dataQualityNotes = qualityIssues.length > 0 ? qualityIssues.join(' | ') : null;
      
      // Get unique subjects and levels
      const centreSubjects = [...new Set(subjectLevelPairs.map(p => p.subject))];
      const centreLevels = [...new Set(subjectLevelPairs.map(p => p.level))];
      
      // Insert the centre (even with no subjects/levels)
      try {
        const centre = await prisma.tuitionCentre.create({
          data: {
            name: centreName,
            location: 'Marine Parade',
            website: sourceUrl || null,
            whatsappNumber: '',
            dataQualityStatus: dataQualityStatus,
            dataQualityNotes: dataQualityNotes
          }
        });
        
        // Create subject relationships
        for (const subjectName of centreSubjects) {
          const subjectId = subjectMap.get(subjectName);
          if (subjectId) {
            await prisma.tuitionCentreSubject.create({
              data: {
                tuitionCentreId: centre.id,
                subjectId: subjectId
              }
            });
          }
        }
        
        // Create level relationships
        for (const levelName of centreLevels) {
          const levelId = levelMap.get(levelName);
          if (levelId) {
            await prisma.tuitionCentreLevel.create({
              data: {
                tuitionCentreId: centre.id,
                levelId: levelId
              }
            });
          }
        }
        
        report.centresCreated++;
        
        const statusIcon = dataQualityStatus === 'OK' ? '✅' : '⚠️';
        console.log(`   ${statusIcon} [${report.centresCreated}] ${centreName}`);
        console.log(`      Status: ${dataQualityStatus}, Subjects: ${centreSubjects.length}, Levels: ${centreLevels.length}`);
        
        if (dataQualityStatus === 'NEEDS_REVIEW') {
          console.log(`      Issues: ${qualityIssues.slice(0, 2).join('; ')}${qualityIssues.length > 2 ? '...' : ''}`);
        }
        
      } catch (error) {
        console.log(`   ❌ [Row ${rowNum}] Failed to insert ${centreName}`);
        console.log(`      Error: ${error.message}`);
        report.centresFailed++;
        report.skipReasons.dbError++;
        report.errors.push({
          row: rowNum,
          name: centreName,
          error: error.message
        });
      }
    }
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('✅ INGESTION COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📊 FINAL REPORT\n');
    console.log('-'.repeat(80));
    console.log('INGESTION SUMMARY:');
    console.log('-'.repeat(80));
    console.log(`Total rows read from Excel:              ${report.totalRows}`);
    console.log(`Unique centres detected:                 ${report.uniqueCentres}`);
    console.log(`  (Uniqueness: by centre name only)`);
    console.log(`\nCentres created successfully:            ${report.centresCreated}`);
    console.log(`Centres skipped:                         ${report.centresSkipped}`);
    console.log(`Centres failed (DB errors):              ${report.centresFailed}`);
    console.log('\n');
    console.log('-'.repeat(80));
    console.log('SKIP REASONS BREAKDOWN:');
    console.log('-'.repeat(80));
    console.log(`Missing centre name:                     ${report.skipReasons.missingName}`);
    console.log(`Duplicate centre name:                   ${report.skipReasons.duplicateName}`);
    console.log(`Database/Prisma errors:                  ${report.skipReasons.dbError}`);
    console.log('\n');
    console.log('-'.repeat(80));
    console.log('DATA QUALITY FLAGS:');
    console.log('-'.repeat(80));
    console.log(`Centres flagged NEEDS_REVIEW:            ${report.qualityFlags.needsReview + report.qualityFlags.unknownLevels + report.qualityFlags.invalidSubjects + report.qualityFlags.noValidSubjects}`);
    console.log(`  - Flagged in source data:              ${report.qualityFlags.needsReview}`);
    console.log(`  - Contains UNKNOWN levels:             ${report.qualityFlags.unknownLevels}`);
    console.log(`  - Has invalid subjects:                ${report.qualityFlags.invalidSubjects}`);
    console.log(`  - No valid subjects:                   ${report.qualityFlags.noValidSubjects}`);
    console.log(`Centres missing website:                 ${report.qualityFlags.missingWebsite}`);
    console.log('\n');
    
    if (report.errors.length > 0) {
      console.log('-'.repeat(80));
      console.log('DATABASE ERRORS:');
      console.log('-'.repeat(80));
      report.errors.forEach(err => {
        console.log(`Row ${err.row}: ${err.name}`);
        console.log(`  Error: ${err.error}`);
      });
      console.log('\n');
    }
    
    console.log('-'.repeat(80));
    console.log('POLICY CHANGES APPLIED:');
    console.log('-'.repeat(80));
    console.log('✓ ALL centres inserted (no blocking on quality issues)');
    console.log('✓ Data quality tracked in dataQualityStatus field');
    console.log('✓ Quality issues documented in dataQualityNotes field');
    console.log('✓ UNKNOWN levels and messy subjects flagged but not blocked');
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Fatal error during ingestion:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ingestAllCentres();
