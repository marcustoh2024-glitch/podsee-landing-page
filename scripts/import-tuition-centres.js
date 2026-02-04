/**
 * PRODUCTION IMPORT: Tuition Centre Data
 * 
 * This script imports tuition centres from Excel into the database.
 * - Idempotent: Safe to run multiple times
 * - No duplicates: Uses deterministic matching (name + location)
 * - Maintains schema constraints
 */

const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================================================
// SUBJECT NORMALIZATION MAP
// ============================================================================

const SUBJECT_NORMALIZATION = {
  // Mathematics variations
  'Math': 'Mathematics',
  'Maths': 'Mathematics',
  'E-Math': 'Elementary Mathematics',
  'E Math': 'Elementary Mathematics',
  'Elementary Math': 'Elementary Mathematics',
  'A-Math': 'Additional Mathematics',
  'A Math': 'Additional Mathematics',
  'A- Math': 'Additional Mathematics',
  'Additional Math': 'Additional Mathematics',
  
  // Science variations
  'Pure Physics': 'Physics',
  'Pure Chemistry': 'Chemistry',
  'Pure Biology': 'Biology',
  'Science (Chem/Physics)': 'Science',
  'IP/Express Science': 'Science',
  'Sciences/Maths': 'Science',
  
  // Accounting
  'POA': 'Principles of Accounting',
  'Principle of Accounts (POA)': 'Principles of Accounting',
  
  // English
  'General Paper (GP)': 'General Paper',
  'General Paper English': 'General Paper',
  
  // Remove qualifiers - treat as base subject
  'Elementary Mathematics (O Level)': 'Elementary Mathematics',
  'Additional Mathematics (O Level)': 'Additional Mathematics',
  'Biology (O Level)': 'Biology',
  'Chemistry (O Level)': 'Chemistry',
  'Physics (O Level)': 'Physics',
  'English (O level)': 'English',
  'English (IP)': 'English',
  'Mathematics (GEP)': 'Mathematics',
  'Science (GEP)': 'Science',
  'Mathematics (IP)': 'Mathematics',
  'Science (IP)': 'Science',
  'Biology (IP)': 'Biology',
  'Chemistry (IP)': 'Chemistry',
  'Physics (IP)': 'Physics',
  'Chinese (Normal/Express/HCL)': 'Chinese',
  
  // IB subjects - keep as distinct
  'Mathematics (IB Diploma HL/SL)': 'Mathematics (IB)',
  'Science (IB Diploma HL/SL)': 'Science (IB)',
  'Biology (IB Diploma HL/SL)': 'Biology (IB)',
  'Chemistry (IB Diploma HL/SL)': 'Chemistry (IB)',
  'Physics (IB Diploma HL/SL)': 'Physics (IB)',
};

// Subjects to skip (not actual subjects)
const SKIP_SUBJECTS = new Set([
  'Primary', 'Secondary', 'H1', 'H2', 'IB SL', 'IB HL',
  'Pure', 'Combined', 'Express English', 'Express Math', 'Express Science',
  'IP English', 'IP Math', 'IP Science',
  'MATHS TUITION', // Too generic
  'Sciences (Physics', 'Biology)', // Malformed
  // Program-specific courses
  'P1 Mighty Reader', 'P5 & 6 Sci Boost', 'P5 Math-Booster', 
  'P6 Science Mock Exam', 'PSLE A* Writer', 'PSLE Mathematics Preparation',
  'S4 AMath Intensive Revision', 'S4 Pure Physics Intensive Revision',
  'Chinese 4Cs', 'Higher Chinese 4Cs', 'Chinese Enrichment',
  'Chinese Essay Writing', 'Chinese Language Enrichment Program',
  'Chinese Public Speaking', 'Chinese Workshop', 'English Workshop',
  'Master Chinese for Exams & Beyond', 'Young Science Explorers',
  // Skill-based, not subjects
  'Creative Writing', 'Comprehension', 'Grammar and Sentence Construction',
  'Oral', 'Vocabulary', 'Paper 1', 'Paper 2',
  'Paper 1 – Writing (Editing, Situational Writing, Continuous Writing)',
  'Paper 2 – Comprehension', 'Paper 3 – Listening Comprehension',
  'Paper 4 – Oral Communication (Reading Aloud & Spoken Interaction)',
  // Math sub-topics (too granular)
  'Numbers', 'Addition, Subtraction & Early Multiplication', 'Money',
  'Measurement and Geometry', 'Statistics', 'Factors and Multiples',
  'Four Operations', 'Fractions', 'Decimals', '2D and 3D Shapes & Nets',
  'Time and Area', 'Algebra', 'Computational Fluency', 'Times Tables',
  'Fractions and Decimals', 'Reasoning', 'Problem Solving',
  'Positive and Negative Numbers', 'Ratio', 'Fractions and Percentages',
  'Equations', 'Graphing',
  // IGCSE variants (keep main subjects only)
  'IGCSE E-Math', 'IGCSE A- Math', 'IGCSE Pure', 'IGCSE Combined',
  'IGCSE High School Mathematics',
  // Excellence programs
  'Excellence in English', 'Excellence in Writing', 'Excellence in Science',
  'Excellence in Mathematics', 'Excellence in English (IP)',
  'Excellence in Additional Mathematics',
  // Other
  'Secondary Physics', 'O Level Higher Chinese',
]);

// ============================================================================
// PARSING LOGIC (from dry-run)
// ============================================================================

function parseLevelRange(rangeStr) {
  const levels = [];
  
  if (rangeStr === 'UNKNOWN') {
    return [];
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
  
  return [];
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
    
    const levels = levelRange ? parseLevelRange(levelRange) : [];
    
    entries.push({
      subject: normalizeSubjectName(subjectName),
      levels: levels,
    });
  });
  
  return entries;
}

function normalizeSubjectName(name) {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  return SUBJECT_NORMALIZATION[trimmed] || trimmed;
}

function shouldSkipSubject(subjectName) {
  return SKIP_SUBJECTS.has(subjectName);
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function findOrCreateLevel(levelName) {
  return await prisma.level.upsert({
    where: { name: levelName },
    update: {},
    create: { name: levelName },
  });
}

async function findOrCreateSubject(subjectName) {
  return await prisma.subject.upsert({
    where: { name: subjectName },
    update: {},
    create: { name: subjectName },
  });
}

async function findCentre(name, location) {
  return await prisma.tuitionCentre.findFirst({
    where: {
      name: name,
      location: location,
    },
    include: {
      subjects: true,
      levels: true,
    },
  });
}

async function createOrUpdateCentre(centreData, subjectIds, levelIds) {
  const existing = await findCentre(centreData.name, centreData.location);
  
  if (existing) {
    // Update existing centre
    await prisma.tuitionCentre.update({
      where: { id: existing.id },
      data: {
        website: centreData.website,
        whatsappNumber: centreData.whatsappNumber,
      },
    });
    
    // Update subjects (replace all)
    await prisma.tuitionCentreSubject.deleteMany({
      where: { tuitionCentreId: existing.id },
    });
    
    for (const subjectId of subjectIds) {
      await prisma.tuitionCentreSubject.create({
        data: {
          tuitionCentreId: existing.id,
          subjectId: subjectId,
        },
      });
    }
    
    // Update levels (replace all)
    await prisma.tuitionCentreLevel.deleteMany({
      where: { tuitionCentreId: existing.id },
    });
    
    for (const levelId of levelIds) {
      await prisma.tuitionCentreLevel.create({
        data: {
          tuitionCentreId: existing.id,
          levelId: levelId,
        },
      });
    }
    
    return { centre: existing, isNew: false };
  } else {
    // Create new centre
    const centre = await prisma.tuitionCentre.create({
      data: {
        name: centreData.name,
        location: centreData.location,
        website: centreData.website,
        whatsappNumber: centreData.whatsappNumber,
      },
    });
    
    // Add subjects
    for (const subjectId of subjectIds) {
      await prisma.tuitionCentreSubject.create({
        data: {
          tuitionCentreId: centre.id,
          subjectId: subjectId,
        },
      });
    }
    
    // Add levels
    for (const levelId of levelIds) {
      await prisma.tuitionCentreLevel.create({
        data: {
          tuitionCentreId: centre.id,
          levelId: levelId,
        },
      });
    }
    
    return { centre, isNew: true };
  }
}

// ============================================================================
// MAIN IMPORT LOGIC
// ============================================================================

async function importTuitionCentres() {
  console.log('='.repeat(80));
  console.log('TUITION CENTRE DATABASE IMPORT');
  console.log('='.repeat(80));
  console.log('\n');
  
  try {
    // Read Excel file
    const filePath = path.join(process.cwd(), 'Offerings_MarineParade_Encoded.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    console.log(`📖 Reading ${data.length} rows from Excel...\n`);
    
    for (const row of data) {
      const centreName = row.centre_name?.trim();
      
      if (!centreName) {
        skipped++;
        continue;
      }
      
      console.log(`Processing: ${centreName}`);
      
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
      
      // Collect unique subjects and levels
      const subjectNames = new Set();
      const levelNames = new Set();
      
      allEntries.forEach(entry => {
        if (!shouldSkipSubject(entry.subject)) {
          subjectNames.add(entry.subject);
          entry.levels.forEach(level => {
            if (level !== 'UNKNOWN') {
              levelNames.add(level);
            }
          });
        }
      });
      
      // Skip centres with no valid subjects
      if (subjectNames.size === 0) {
        console.log(`  ⏭️  Skipped: No valid subjects\n`);
        skipped++;
        continue;
      }
      
      // Create/find subjects and levels
      const subjectIds = [];
      for (const subjectName of subjectNames) {
        const subject = await findOrCreateSubject(subjectName);
        subjectIds.push(subject.id);
      }
      
      const levelIds = [];
      for (const levelName of levelNames) {
        const level = await findOrCreateLevel(levelName);
        levelIds.push(level.id);
      }
      
      // Create or update centre
      const centreData = {
        name: centreName,
        location: 'Marine Parade',
        website: row.source_url?.trim() || null,
        whatsappNumber: 'Not Available', // Placeholder
      };
      
      const result = await createOrUpdateCentre(centreData, subjectIds, levelIds);
      
      if (result.isNew) {
        created++;
        console.log(`  ✅ Created with ${subjectNames.size} subjects, ${levelNames.size} levels\n`);
      } else {
        updated++;
        console.log(`  🔄 Updated with ${subjectNames.size} subjects, ${levelNames.size} levels\n`);
      }
    }
    
    console.log('='.repeat(80));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Centres created:  ${created}`);
    console.log(`Centres updated:  ${updated}`);
    console.log(`Rows skipped:     ${skipped}`);
    console.log(`Total processed:  ${created + updated + skipped}`);
    console.log('\n');
    
    // Verify database state
    const totalCentres = await prisma.tuitionCentre.count();
    const totalSubjects = await prisma.subject.count();
    const totalLevels = await prisma.level.count();
    
    console.log('='.repeat(80));
    console.log('DATABASE STATE');
    console.log('='.repeat(80));
    console.log(`Total centres:  ${totalCentres}`);
    console.log(`Total subjects: ${totalSubjects}`);
    console.log(`Total levels:   ${totalLevels}`);
    console.log('\n');
    
    console.log('✅ Import completed successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importTuitionCentres();
