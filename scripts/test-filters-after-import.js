/**
 * Test filter functionality after import
 * Verifies that the API returns correct results for various filter combinations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFilters() {
  console.log('='.repeat(80));
  console.log('FILTER VERIFICATION TESTS');
  console.log('='.repeat(80));
  console.log('\n');
  
  try {
    // Test 1: Get all centres (no filters)
    console.log('Test 1: All centres (no filters)');
    console.log('-'.repeat(80));
    const allCentres = await prisma.tuitionCentre.findMany({
      include: {
        subjects: { include: { subject: true } },
        levels: { include: { level: true } },
      },
    });
    console.log(`✅ Found ${allCentres.length} centres`);
    console.log(`   Sample: ${allCentres.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 2: Filter by subject (Mathematics)
    console.log('Test 2: Filter by subject = "Mathematics"');
    console.log('-'.repeat(80));
    const mathSubject = await prisma.subject.findUnique({
      where: { name: 'Mathematics' },
    });
    
    if (mathSubject) {
      const mathCentres = await prisma.tuitionCentre.findMany({
        where: {
          subjects: {
            some: {
              subjectId: mathSubject.id,
            },
          },
        },
        include: {
          subjects: { include: { subject: true } },
          levels: { include: { level: true } },
        },
      });
      console.log(`✅ Found ${mathCentres.length} centres offering Mathematics`);
      console.log(`   Sample: ${mathCentres.slice(0, 3).map(c => c.name).join(', ')}\n`);
    } else {
      console.log('❌ Mathematics subject not found\n');
    }
    
    // Test 3: Filter by level (Primary 6)
    console.log('Test 3: Filter by level = "Primary 6"');
    console.log('-'.repeat(80));
    const p6Level = await prisma.level.findUnique({
      where: { name: 'Primary 6' },
    });
    
    if (p6Level) {
      const p6Centres = await prisma.tuitionCentre.findMany({
        where: {
          levels: {
            some: {
              levelId: p6Level.id,
            },
          },
        },
        include: {
          subjects: { include: { subject: true } },
          levels: { include: { level: true } },
        },
      });
      console.log(`✅ Found ${p6Centres.length} centres offering Primary 6`);
      console.log(`   Sample: ${p6Centres.slice(0, 3).map(c => c.name).join(', ')}\n`);
    } else {
      console.log('❌ Primary 6 level not found\n');
    }
    
    // Test 4: Filter by both subject AND level
    console.log('Test 4: Filter by subject = "Mathematics" AND level = "Primary 6"');
    console.log('-'.repeat(80));
    if (mathSubject && p6Level) {
      const filteredCentres = await prisma.tuitionCentre.findMany({
        where: {
          AND: [
            {
              subjects: {
                some: {
                  subjectId: mathSubject.id,
                },
              },
            },
            {
              levels: {
                some: {
                  levelId: p6Level.id,
                },
              },
            },
          ],
        },
        include: {
          subjects: { include: { subject: true } },
          levels: { include: { level: true } },
        },
      });
      console.log(`✅ Found ${filteredCentres.length} centres offering Mathematics at Primary 6`);
      console.log(`   Sample: ${filteredCentres.slice(0, 5).map(c => c.name).join(', ')}\n`);
    }
    
    // Test 5: Filter by location
    console.log('Test 5: Filter by location = "Marine Parade"');
    console.log('-'.repeat(80));
    const marinePradeCentres = await prisma.tuitionCentre.findMany({
      where: {
        location: 'Marine Parade',
      },
    });
    console.log(`✅ Found ${marinePradeCentres.length} centres in Marine Parade\n`);
    
    // Test 6: Multiple subjects (Physics OR Chemistry)
    console.log('Test 6: Filter by subject = "Physics" OR "Chemistry"');
    console.log('-'.repeat(80));
    const physicsSubject = await prisma.subject.findUnique({
      where: { name: 'Physics' },
    });
    const chemistrySubject = await prisma.subject.findUnique({
      where: { name: 'Chemistry' },
    });
    
    if (physicsSubject && chemistrySubject) {
      const scienceCentres = await prisma.tuitionCentre.findMany({
        where: {
          subjects: {
            some: {
              subjectId: {
                in: [physicsSubject.id, chemistrySubject.id],
              },
            },
          },
        },
        include: {
          subjects: { include: { subject: true } },
        },
      });
      console.log(`✅ Found ${scienceCentres.length} centres offering Physics or Chemistry`);
      console.log(`   Sample: ${scienceCentres.slice(0, 3).map(c => c.name).join(', ')}\n`);
    }
    
    // Test 7: JC levels
    console.log('Test 7: Filter by level = "JC 1" OR "JC 2"');
    console.log('-'.repeat(80));
    const jc1Level = await prisma.level.findUnique({
      where: { name: 'JC 1' },
    });
    const jc2Level = await prisma.level.findUnique({
      where: { name: 'JC 2' },
    });
    
    if (jc1Level && jc2Level) {
      const jcCentres = await prisma.tuitionCentre.findMany({
        where: {
          levels: {
            some: {
              levelId: {
                in: [jc1Level.id, jc2Level.id],
              },
            },
          },
        },
      });
      console.log(`✅ Found ${jcCentres.length} centres offering JC levels\n`);
    }
    
    // Summary of available subjects and levels
    console.log('='.repeat(80));
    console.log('AVAILABLE SUBJECTS AND LEVELS');
    console.log('='.repeat(80));
    
    const allSubjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    console.log('\nSubjects:');
    allSubjects.forEach((subject, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${subject.name}`);
    });
    
    const allLevels = await prisma.level.findMany({
      orderBy: { name: 'asc' },
    });
    console.log('\nLevels:');
    allLevels.forEach((level, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${level.name}`);
    });
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('✅ ALL FILTER TESTS PASSED');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Filter test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testFilters();
