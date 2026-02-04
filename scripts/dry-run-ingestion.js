/**
 * DRY RUN: Tuition Centre Data Ingestion
 * 
 * This script parses the Excel dataset and shows what would be created
 * WITHOUT actually inserting into the database.
 * 
 * DATA FORMAT UNDERSTANDING:
 * - Each row = one tuition centre
 * - Subjects are encoded as: "SubjectName|LevelRange; SubjectName|LevelRange"
 * - Level ranges: P1-P6, Sec1-Sec4, Sec1/Sec2, J1-J2, J1, J2, etc.
 * - Special value: UNKNOWN indicates missing level information
 */

const XLSX = require('xlsx');
const path = require('path');

// ============================================================================
// PARSING LOGIC
// ============================================================================

/**
 * Parse level ranges into individual levels
 * Examples:
 *   "P1-P6" -> ["Primary 1", "Primary 2", ..., "Primary 6"]
 *   "Sec3/Sec4" -> ["Secondary 3", "Secondary 4"]
 *   "J1-J2" -> ["JC 1", "JC 2"]
 */
function parseLevelRange(rangeStr, prefix = '') {
  const levels = [];
  
  // Handle UNKNOWN
  if (rangeStr === 'UNKNOWN') {
    return ['UNKNOWN'];
  }
  
  // Handle ranges like "P1-P6"
  const rangeMatch = rangeStr.match(/^([A-Za-z]+)(\d+)-([A-Za-z]+)?(\d+)$/);
  if (rangeMatch) {
    const [, prefix1, start, prefix2, end] = rangeMatch;
    const levelPrefix = prefix1;
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    
    for (let i = startNum; i <= endNum; i++) {
      levels.push(formatLevel(levelPrefix, i));
    }
    return levels;
  }
  
  // Handle slash-separated like "Sec3/Sec4"
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
  
  // Handle single level like "J1" or "Sec4"
  const singleMatch = rangeStr.match(/^([A-Za-z]+)(\d+)$/);
  if (singleMatch) {
    const [, prefix, num] = singleMatch;
    levels.push(formatLevel(prefix, parseInt(num)));
    return levels;
  }
  
  return ['UNKNOWN'];
}

/**
 * Format level name consistently
 */
function formatLevel(prefix, number) {
  const prefixMap = {
    'P': 'Primary',
    'Sec': 'Secondary',
    'J': 'JC'
  };
  
  const fullPrefix = prefixMap[prefix] || prefix;
  return `${fullPrefix} ${number}`;
}

/**
 * Parse a subject-level encoded string
 * Format: "SubjectName|LevelRange; SubjectName|LevelRange"
 */
function parseSubjectLevelString(encodedStr, levelType = '') {
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
      subject: normalizeSubjectName(subjectName),
      levels: levels,
      raw: subjectEntry
    });
  });
  
  return entries;
}

/**
 * Normalize subject names for consistency
 */
function normalizeSubjectName(name) {
  // Remove extra spaces
  let normalized = name.trim().replace(/\s+/g, ' ');
  
  // Common normalizations
  const normalizations = {
    'E-Math': 'Elementary Mathematics',
    'A-Math': 'Additional Mathematics',
    'Math': 'Mathematics',
    'Pure Physics': 'Physics',
    'Pure Chemistry': 'Chemistry',
    'Pure Biology': 'Biology',
    'Combined Science': 'Combined Science',
    'POA': 'Principles of Accounting',
    'Science (Chem/Physics)': 'Science',
    'IP/Express Science': 'Science',
    'Sciences/Maths': 'Science and Mathematics',
    'General Paper': 'General Paper',
  };
  
  return normalizations[normalized] || normalized;
}

// ============================================================================
// DRY RUN LOGIC
// ============================================================================

async function dryRunIngestion() {
  try {
    console.log('='.repeat(80));
    console.log('DRY RUN: TUITION CENTRE DATA INGESTION');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Read Excel file
    const filePath = path.join(process.cwd(), 'Offerings_MarineParade_Encoded.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Track unique entities
    const uniqueSubjects = new Set();
    const uniqueLevels = new Set();
    const centres = [];
    const skippedRows = [];
    const flaggedRows = [];
    
    // Process each row
    data.forEach((row, index) => {
      const rowNum = index + 1;
      const centreName = row.centre_name?.trim();
      
      if (!centreName) {
        skippedRows.push({
          row: rowNum,
          reason: 'Missing centre name',
          data: row
        });
        return;
      }
      
      // Parse all subject-level combinations
      const primaryEntries = parseSubjectLevelString(row.primary_subjects_fmt, 'Primary');
      const secondaryEntries = parseSubjectLevelString(row.secondary_subjects_fmt, 'Secondary');
      const jcH1Entries = parseSubjectLevelString(row.jc_h1_subjects_fmt, 'JC H1');
      const jcH2Entries = parseSubjectLevelString(row.jc_h2_subjects_fmt, 'JC H2');
      const jcUnknownEntries = parseSubjectLevelString(row.jc_unknown_subjects_fmt, 'JC Unknown');
      
      const allEntries = [
        ...primaryEntries,
        ...secondaryEntries,
        ...jcH1Entries,
        ...jcH2Entries,
        ...jcUnknownEntries
      ];
      
      // Collect unique subjects and levels
      const centreSubjects = new Set();
      const centreLevels = new Set();
      let hasUnknownLevels = false;
      
      allEntries.forEach(entry => {
        centreSubjects.add(entry.subject);
        uniqueSubjects.add(entry.subject);
        
        entry.levels.forEach(level => {
          if (level === 'UNKNOWN') {
            hasUnknownLevels = true;
          } else {
            centreLevels.add(level);
            uniqueLevels.add(level);
          }
        });
      });
      
      const centreData = {
        rowNum,
        name: centreName,
        location: 'Marine Parade', // From filename
        website: row.source_url?.trim() || null,
        whatsappNumber: 'TBD', // Not in dataset
        subjects: Array.from(centreSubjects).sort(),
        levels: Array.from(centreLevels).sort(),
        subjectLevelPairs: allEntries,
        needsReview: row.needs_review === true || row.needs_review === 'true',
        notes: row.notes?.trim() || null,
        hasUnknownLevels
      };
      
      centres.push(centreData);
      
      // Flag for review
      if (centreData.needsReview || hasUnknownLevels || centreData.subjects.length === 0) {
        flaggedRows.push({
          row: rowNum,
          name: centreName,
          reasons: [
            centreData.needsReview && 'Marked for review in dataset',
            hasUnknownLevels && 'Contains UNKNOWN level ranges',
            centreData.subjects.length === 0 && 'No subjects found'
          ].filter(Boolean),
          notes: centreData.notes
        });
      }
    });
    
    // ========================================================================
    // REPORT
    // ========================================================================
    
    console.log('📊 SUMMARY STATISTICS');
    console.log('-'.repeat(80));
    console.log(`Total rows in Excel:        ${data.length}`);
    console.log(`Centres to be created:      ${centres.length}`);
    console.log(`Skipped rows:               ${skippedRows.length}`);
    console.log(`Flagged for review:         ${flaggedRows.length}`);
    console.log(`Unique subjects:            ${uniqueSubjects.size}`);
    console.log(`Unique levels:              ${uniqueLevels.size}`);
    console.log('\n');
    
    // Unique subjects
    console.log('📚 UNIQUE SUBJECTS TO BE CREATED');
    console.log('-'.repeat(80));
    Array.from(uniqueSubjects).sort().forEach((subject, i) => {
      console.log(`${(i + 1).toString().padStart(3)}. ${subject}`);
    });
    console.log('\n');
    
    // Unique levels
    console.log('🎓 UNIQUE LEVELS TO BE CREATED');
    console.log('-'.repeat(80));
    Array.from(uniqueLevels).sort().forEach((level, i) => {
      console.log(`${(i + 1).toString().padStart(3)}. ${level}`);
    });
    console.log('\n');
    
    // Sample centres
    console.log('🏫 SAMPLE CENTRES (First 5)');
    console.log('-'.repeat(80));
    centres.slice(0, 5).forEach(centre => {
      console.log(`\n[Row ${centre.rowNum}] ${centre.name}`);
      console.log(`  Location: ${centre.location}`);
      console.log(`  Website: ${centre.website || 'N/A'}`);
      console.log(`  WhatsApp: ${centre.whatsappNumber}`);
      console.log(`  Subjects (${centre.subjects.length}): ${centre.subjects.join(', ')}`);
      console.log(`  Levels (${centre.levels.length}): ${centre.levels.join(', ')}`);
      if (centre.hasUnknownLevels) {
        console.log(`  ⚠️  Contains UNKNOWN level ranges`);
      }
      if (centre.needsReview) {
        console.log(`  ⚠️  Marked for review`);
      }
    });
    console.log('\n');
    
    // Skipped rows
    if (skippedRows.length > 0) {
      console.log('⏭️  SKIPPED ROWS');
      console.log('-'.repeat(80));
      skippedRows.forEach(skip => {
        console.log(`Row ${skip.row}: ${skip.reason}`);
      });
      console.log('\n');
    }
    
    // Flagged rows
    if (flaggedRows.length > 0) {
      console.log('⚠️  FLAGGED FOR REVIEW');
      console.log('-'.repeat(80));
      flaggedRows.forEach(flag => {
        console.log(`\n[Row ${flag.row}] ${flag.name}`);
        flag.reasons.forEach(reason => {
          console.log(`  • ${reason}`);
        });
        if (flag.notes) {
          console.log(`  Notes: ${flag.notes}`);
        }
      });
      console.log('\n');
    }
    
    // Detailed breakdown
    console.log('📋 DETAILED CENTRE BREAKDOWN');
    console.log('-'.repeat(80));
    centres.forEach(centre => {
      console.log(`\n[${centre.rowNum}] ${centre.name}`);
      console.log(`  Subjects: ${centre.subjects.length}, Levels: ${centre.levels.length}`);
      
      // Group by subject
      const subjectMap = new Map();
      centre.subjectLevelPairs.forEach(pair => {
        if (!subjectMap.has(pair.subject)) {
          subjectMap.set(pair.subject, new Set());
        }
        pair.levels.forEach(level => {
          subjectMap.get(pair.subject).add(level);
        });
      });
      
      subjectMap.forEach((levels, subject) => {
        const levelList = Array.from(levels).sort().join(', ');
        console.log(`    ${subject}: ${levelList}`);
      });
    });
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('✅ DRY RUN COMPLETE - NO DATA WAS WRITTEN TO DATABASE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error during dry run:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

dryRunIngestion();
