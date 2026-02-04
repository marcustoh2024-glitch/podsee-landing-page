/**
 * Tuition Centre Data Ingestion Script
 * 
 * This script:
 * 1. Reads the Excel dataset
 * 2. Normalizes subjects to canonical academic subjects
 * 3. Parses level ranges
 * 4. Inserts centres, subjects, levels, and relationships into the database
 */

const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { normalizeSubject, getCanonicalSubjects } = require('./subject-normalization');

const prisma = new PrismaClient();

// ============================================================================
// PARSING LOGIC (same as dry-run)
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

async function ingestTuitionCentres() {
  try {
    console.log('='.repeat(80));
    console.log('TUITION CENTRE DATA INGESTION');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Read Excel file
    const filePath = path.join(process.cwd(), 'Offerings_MarineParade_Encoded.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📖 Read ${data.length} rows from Excel\n`);
    
    // ========================================================================
    // STEP 1: Create all unique subjects
    // ========================================================================
    
    console.log('📚 STEP 1: Creating canonical subjects...');
    const canonicalSubjects = getCanonicalSubjects();
    console.log(`   Found ${canonicalSubjects.length} canonical subjects\n`);
    
    const subjectMap = new Map(); // name -> id
    
    for (const subjectName of canonicalSubjects) {
      const subject = await prisma.subject.upsert({
        where: { name: subjectName },
        update: {},
        create: { name: subjectName }
      });
      subjectMap.set(subjectName, subject.id);
      console.log(`   ✓ ${subjectName}`);
    }
    
    console.log(`\n   Created/verified ${subjectMap.size} subjects\n`);
    
    // ========================================================================
    // STEP 2: Create all unique levels
    // ========================================================================
    
    console.log('🎓 STEP 2: Creating levels...');
    const levelNames = [
      'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
      'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4',
      'JC 1', 'JC 2'
    ];
    
    const levelMap = new Map(); // name -> id
    
    for (const levelName of levelNames) {
      const level = await prisma.level.upsert({
        where: { name: levelName },
        update: {},
        create: { name: levelName }
      });
      levelMap.set(levelName, level.id);
      console.log(`   ✓ ${levelName}`);
    }
    
    console.log(`\n   Created/verified ${levelMap.size} levels\n`);
    
    // ========================================================================
    // STEP 3: Process and insert tuition centres
    // ========================================================================
    
    console.log('🏫 STEP 3: Inserting tuition centres...\n');
    
    let insertedCount = 0;
    let skippedCount = 0;
    const stats = {
      totalSubjectsNormalized: 0,
      totalSubjectsFiltered: 0,
      centresWithUnknownLevels: 0
    };
    
    for (const row of data) {
      const centreName = row.centre_name?.trim();
      
      if (!centreName) {
        console.log(`   ⏭️  Skipping row: no centre name`);
        skippedCount++;
        continue;
      }
      
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
      
      // Normalize subjects and build subject-level pairs
      const subjectLevelPairs = [];
      let hasUnknownLevels = false;
      
      for (const entry of allEntries) {
        const canonicalSubject = normalizeSubject(entry.rawSubject);
        
        if (!canonicalSubject) {
          stats.totalSubjectsFiltered++;
          continue; // Skip non-subjects
        }
        
        stats.totalSubjectsNormalized++;
        
        for (const level of entry.levels) {
          if (level === 'UNKNOWN') {
            hasUnknownLevels = true;
            // Don't add UNKNOWN levels to the database
            continue;
          }
          
          subjectLevelPairs.push({
            subject: canonicalSubject,
            level: level
          });
        }
      }
      
      if (hasUnknownLevels) {
        stats.centresWithUnknownLevels++;
      }
      
      // Get unique subjects and levels for this centre
      const centreSubjects = [...new Set(subjectLevelPairs.map(p => p.subject))];
      const centreLevels = [...new Set(subjectLevelPairs.map(p => p.level))];
      
      // Create the tuition centre
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: centreName,
          location: 'Marine Parade',
          website: row.source_url?.trim() || null,
          whatsappNumber: '' // Empty string for now, can be updated later
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
      
      insertedCount++;
      console.log(`   ✓ [${insertedCount}] ${centreName}`);
      console.log(`      Subjects: ${centreSubjects.length}, Levels: ${centreLevels.length}${hasUnknownLevels ? ' (has UNKNOWN)' : ''}`);
    }
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('✅ INGESTION COMPLETE');
    console.log('='.repeat(80));
    console.log(`\nCentres inserted:              ${insertedCount}`);
    console.log(`Centres skipped:               ${skippedCount}`);
    console.log(`Subjects normalized:           ${stats.totalSubjectsNormalized}`);
    console.log(`Subjects filtered out:         ${stats.totalSubjectsFiltered}`);
    console.log(`Centres with UNKNOWN levels:   ${stats.centresWithUnknownLevels}`);
    console.log(`\nTotal subjects in DB:          ${subjectMap.size}`);
    console.log(`Total levels in DB:            ${levelMap.size}`);
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ingestTuitionCentres();
