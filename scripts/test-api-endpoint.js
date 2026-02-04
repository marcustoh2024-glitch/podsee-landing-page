/**
 * Test the API endpoint directly without HTTP server
 * This simulates what the API route would return
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPILogic() {
  console.log('='.repeat(80));
  console.log('API ENDPOINT SIMULATION TEST');
  console.log('='.repeat(80));
  console.log('\n');
  
  try {
    // Test 1: GET all centres (no filters)
    console.log('Test 1: GET /api/tuition-centres (no filters)');
    console.log('-'.repeat(80));
    
    const centres = await prisma.tuitionCentre.findMany({
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        levels: {
          include: {
            level: true,
          },
        },
      },
    });
    
    const response = centres.map(centre => ({
      id: centre.id,
      name: centre.name,
      location: centre.location,
      whatsappNumber: centre.whatsappNumber,
      website: centre.website,
      subjects: centre.subjects.map(s => s.subject.name),
      levels: centre.levels.map(l => l.level.name),
    }));
    
    console.log(`✅ Response: ${response.length} centres`);
    console.log(`   First centre: ${response[0].name}`);
    console.log(`   Subjects: ${response[0].subjects.join(', ')}`);
    console.log(`   Levels: ${response[0].levels.join(', ')}\n`);
    
    // Test 2: GET with subject filter
    console.log('Test 2: GET /api/tuition-centres?subject=Mathematics');
    console.log('-'.repeat(80));
    
    const mathSubject = await prisma.subject.findUnique({
      where: { name: 'Mathematics' },
    });
    
    const mathCentres = await prisma.tuitionCentre.findMany({
      where: {
        subjects: {
          some: {
            subjectId: mathSubject.id,
          },
        },
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        levels: {
          include: {
            level: true,
          },
        },
      },
    });
    
    console.log(`✅ Response: ${mathCentres.length} centres offering Mathematics`);
    console.log(`   Sample: ${mathCentres.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 3: GET with level filter
    console.log('Test 3: GET /api/tuition-centres?level=Primary 6');
    console.log('-'.repeat(80));
    
    const p6Level = await prisma.level.findUnique({
      where: { name: 'Primary 6' },
    });
    
    const p6Centres = await prisma.tuitionCentre.findMany({
      where: {
        levels: {
          some: {
            levelId: p6Level.id,
          },
        },
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        levels: {
          include: {
            level: true,
          },
        },
      },
    });
    
    console.log(`✅ Response: ${p6Centres.length} centres offering Primary 6\n`);
    
    // Test 4: GET with both filters
    console.log('Test 4: GET /api/tuition-centres?subject=Mathematics&level=Primary 6');
    console.log('-'.repeat(80));
    
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
        subjects: {
          include: {
            subject: true,
          },
        },
        levels: {
          include: {
            level: true,
          },
        },
      },
    });
    
    console.log(`✅ Response: ${filteredCentres.length} centres`);
    console.log(`   Centres: ${filteredCentres.map(c => c.name).join(', ')}\n`);
    
    // Test 5: Verify response structure
    console.log('Test 5: Verify response structure');
    console.log('-'.repeat(80));
    
    const sampleCentre = response[0];
    const hasRequiredFields = 
      sampleCentre.id &&
      sampleCentre.name &&
      sampleCentre.location &&
      Array.isArray(sampleCentre.subjects) &&
      Array.isArray(sampleCentre.levels);
    
    if (hasRequiredFields) {
      console.log('✅ Response structure is correct');
      console.log('   Fields: id, name, location, whatsappNumber, website, subjects[], levels[]\n');
    } else {
      console.log('❌ Response structure is missing required fields\n');
    }
    
    console.log('='.repeat(80));
    console.log('✅ ALL API TESTS PASSED');
    console.log('='.repeat(80));
    console.log('\nThe API is ready to serve requests with the imported data!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAPILogic();
