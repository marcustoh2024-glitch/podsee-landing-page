#!/usr/bin/env node

/**
 * Offerings Ingestion Script
 * 
 * Reads offerings from Excel file and populates:
 * - Level table (unique levels)
 * - Subject table (unique subjects)
 * - Offering table (centre + level + subject combinations)
 * - TuitionCentreLevel (optional join table for display)
 * - TuitionCentreSubject (optional join table for display)
 * 
 * Idempotent: Safe to run multiple times
 * Matches centres by: centre_name + branch_name
 */

const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXCEL_FILE = 'database_ready (1) copy.xlsx';
const SHEET_NAME = 'offerings';

// Column mapping (Excel uses __EMPTY, __EMPTY_1, etc.)
const COLUMNS = {
  CENTRE_NAME: '__EMPTY',
  BRANCH_NAME: '__EMPTY_1',
  AREA: '__EMPTY_2',
  LEVEL: '__EMPTY_3',
  SUBJECT: '__EMPTY_4',
  SOURCE_URL: '__EMPTY_5',
  DATA_QUALITY: '__EMPTY_6'
};

async function main() {
  console.log('🚀 Starting Offerings Ingestion Pipeline\n');
  
  // Step 1: Read Excel file
  console.log('📂 Step 1: Reading Excel file...');
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets[SHEET_NAME];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
  console.log(`   Found ${rows.length} rows in sheet "${SHEET_NAME}"`);
  
  // Skip header row
  const dataRows = rows.slice(1);
  console.log(`   Processing ${dataRows.length} offering rows\n`);
  
  // Step 2: Extract unique levels and subjects
  console.log('📊 Step 2: Extracting unique levels and subjects...');
  const uniqueLevels = new Set();
  const uniqueSubjects = new Set();
  
  dataRows.forEach(row => {
    const level = (row[COLUMNS.LEVEL] || '').trim();
    const subject = (row[COLUMNS.SUBJECT] || '').trim();
    
    if (level) uniqueLevels.add(level);
    if (subject) uniqueSubjects.add(subject);
  });
  
  console.log(`   Unique levels: ${uniqueLevels.size}`);
  console.log(`   Unique subjects: ${uniqueSubjects.size}\n`);
  
  // Step 3: Upsert levels
  console.log('📝 Step 3: Upserting levels...');
  const levelMap = new Map(); // name -> id
  
  for (const levelName of uniqueLevels) {
    const level = await prisma.level.upsert({
      where: { name: levelName },
      update: {},
      create: { name: levelName }
    });
    levelMap.set(levelName, level.id);
  }
  
  console.log(`   ✅ Upserted ${levelMap.size} levels\n`);
  
  // Step 4: Upsert subjects
  console.log('📝 Step 4: Upserting subjects...');
  const subjectMap = new Map(); // name -> id
  
  for (const subjectName of uniqueSubjects) {
    const subject = await prisma.subject.upsert({
      where: { name: subjectName },
      update: {},
      create: { name: subjectName }
    });
    subjectMap.set(subjectName, subject.id);
  }
  
  console.log(`   ✅ Upserted ${subjectMap.size} subjects\n`);
  
  // Step 5: Load all centres into memory for matching
  console.log('🏢 Step 5: Loading tuition centres...');
  const centres = await prisma.tuitionCentre.findMany({
    select: { id: true, name: true }
  });
  
  // Build lookup map: "centre_name|branch_name" -> centreId
  const centreMap = new Map();
  centres.forEach(centre => {
    // Extract centre name and branch from the combined name
    // Format: "Centre Name (Branch)" or just "Centre Name"
    const match = centre.name.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      const [, centreName, branchName] = match;
      const key = `${centreName.trim()}|${branchName.trim()}`;
      centreMap.set(key, centre.id);
    } else {
      // No branch in parentheses, use "Main" as default
      const key = `${centre.name.trim()}|Main`;
      centreMap.set(key, centre.id);
    }
  });
  
  console.log(`   Loaded ${centres.length} centres`);
  console.log(`   Created ${centreMap.size} lookup keys\n`);
  
  // Step 6: Process offerings
  console.log('🔗 Step 6: Creating offerings...');
  
  let created = 0;
  let skipped = 0;
  let centreNotFound = 0;
  const errors = [];
  
  for (const row of dataRows) {
    const centreName = (row[COLUMNS.CENTRE_NAME] || '').trim();
    const branchName = (row[COLUMNS.BRANCH_NAME] || '').trim();
    const levelName = (row[COLUMNS.LEVEL] || '').trim();
    const subjectName = (row[COLUMNS.SUBJECT] || '').trim();
    
    // Skip rows with missing data
    if (!centreName || !levelName || !subjectName) {
      skipped++;
      continue;
    }
    
    // Find centre
    const lookupKey = `${centreName}|${branchName}`;
    const centreId = centreMap.get(lookupKey);
    
    if (!centreId) {
      centreNotFound++;
      errors.push(`Centre not found: ${lookupKey}`);
      continue;
    }
    
    // Get level and subject IDs
    const levelId = levelMap.get(levelName);
    const subjectId = subjectMap.get(subjectName);
    
    if (!levelId || !subjectId) {
      errors.push(`Missing level/subject: ${levelName}/${subjectName}`);
      continue;
    }
    
    // Create offering (upsert to handle duplicates)
    try {
      await prisma.offering.upsert({
        where: {
          tuitionCentreId_levelId_subjectId: {
            tuitionCentreId: centreId,
            levelId: levelId,
            subjectId: subjectId
          }
        },
        update: {},
        create: {
          tuitionCentreId: centreId,
          levelId: levelId,
          subjectId: subjectId
        }
      });
      created++;
    } catch (error) {
      errors.push(`Failed to create offering: ${centreName} | ${levelName} | ${subjectName} - ${error.message}`);
    }
  }
  
  console.log(`   ✅ Created ${created} offerings`);
  console.log(`   ⏭️  Skipped ${skipped} rows (missing data)`);
  console.log(`   ⚠️  Centre not found: ${centreNotFound} rows\n`);
  
  // Step 7: Populate join tables (optional, for display)
  console.log('🔗 Step 7: Populating join tables...');
  
  // Get all unique centre-level pairs from offerings
  const centreLevelPairs = await prisma.offering.findMany({
    select: {
      tuitionCentreId: true,
      levelId: true
    },
    distinct: ['tuitionCentreId', 'levelId']
  });
  
  let levelJoinsCreated = 0;
  for (const pair of centreLevelPairs) {
    try {
      await prisma.tuitionCentreLevel.upsert({
        where: {
          tuitionCentreId_levelId: {
            tuitionCentreId: pair.tuitionCentreId,
            levelId: pair.levelId
          }
        },
        update: {},
        create: {
          tuitionCentreId: pair.tuitionCentreId,
          levelId: pair.levelId
        }
      });
      levelJoinsCreated++;
    } catch (error) {
      // Ignore duplicates
    }
  }
  
  // Get all unique centre-subject pairs from offerings
  const centreSubjectPairs = await prisma.offering.findMany({
    select: {
      tuitionCentreId: true,
      subjectId: true
    },
    distinct: ['tuitionCentreId', 'subjectId']
  });
  
  let subjectJoinsCreated = 0;
  for (const pair of centreSubjectPairs) {
    try {
      await prisma.tuitionCentreSubject.upsert({
        where: {
          tuitionCentreId_subjectId: {
            tuitionCentreId: pair.tuitionCentreId,
            subjectId: pair.subjectId
          }
        },
        update: {},
        create: {
          tuitionCentreId: pair.tuitionCentreId,
          subjectId: pair.subjectId
        }
      });
      subjectJoinsCreated++;
    } catch (error) {
      // Ignore duplicates
    }
  }
  
  console.log(`   ✅ Created ${levelJoinsCreated} centre-level joins`);
  console.log(`   ✅ Created ${subjectJoinsCreated} centre-subject joins\n`);
  
  // Step 8: Final verification
  console.log('✅ Step 8: Final verification...');
  const [levelCount, subjectCount, offeringCount, centreLevelCount, centreSubjectCount] = await Promise.all([
    prisma.level.count(),
    prisma.subject.count(),
    prisma.offering.count(),
    prisma.tuitionCentreLevel.count(),
    prisma.tuitionCentreSubject.count()
  ]);
  
  console.log(`   Levels: ${levelCount}`);
  console.log(`   Subjects: ${subjectCount}`);
  console.log(`   Offerings: ${offeringCount}`);
  console.log(`   Centre-Level joins: ${centreLevelCount}`);
  console.log(`   Centre-Subject joins: ${centreSubjectCount}\n`);
  
  // Show errors if any
  if (errors.length > 0) {
    console.log('⚠️  Errors encountered:');
    errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors\n`);
    }
  }
  
  console.log('🎉 Offerings ingestion complete!\n');
}

main()
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
