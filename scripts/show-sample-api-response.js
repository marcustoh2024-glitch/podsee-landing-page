/**
 * Display sample API responses in JSON format
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showSampleResponses() {
  console.log('='.repeat(80));
  console.log('SAMPLE API RESPONSES');
  console.log('='.repeat(80));
  console.log('\n');
  
  try {
    // Sample 1: Single centre detail
    console.log('1. GET /api/tuition-centres (first result)');
    console.log('-'.repeat(80));
    
    const centres = await prisma.tuitionCentre.findMany({
      take: 1,
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
    
    const formatted = centres.map(centre => ({
      id: centre.id,
      name: centre.name,
      location: centre.location,
      whatsappNumber: centre.whatsappNumber,
      website: centre.website,
      subjects: centre.subjects.map(s => s.subject.name).sort(),
      levels: centre.levels.map(l => l.level.name).sort(),
    }));
    
    console.log(JSON.stringify(formatted[0], null, 2));
    console.log('\n');
    
    // Sample 2: Filtered results
    console.log('2. GET /api/tuition-centres?subject=Physics&level=JC 1');
    console.log('-'.repeat(80));
    
    const physicsSubject = await prisma.subject.findUnique({
      where: { name: 'Physics' },
    });
    const jc1Level = await prisma.level.findUnique({
      where: { name: 'JC 1' },
    });
    
    const filtered = await prisma.tuitionCentre.findMany({
      where: {
        AND: [
          {
            subjects: {
              some: {
                subjectId: physicsSubject.id,
              },
            },
          },
          {
            levels: {
              some: {
                levelId: jc1Level.id,
              },
            },
          },
        ],
      },
      take: 3,
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
    
    const filteredFormatted = filtered.map(centre => ({
      id: centre.id,
      name: centre.name,
      location: centre.location,
      whatsappNumber: centre.whatsappNumber,
      website: centre.website,
      subjects: centre.subjects.map(s => s.subject.name).sort(),
      levels: centre.levels.map(l => l.level.name).sort(),
    }));
    
    console.log(JSON.stringify(filteredFormatted, null, 2));
    console.log('\n');
    
    // Sample 3: Statistics
    console.log('3. Database Statistics');
    console.log('-'.repeat(80));
    
    const stats = {
      totalCentres: await prisma.tuitionCentre.count(),
      totalSubjects: await prisma.subject.count(),
      totalLevels: await prisma.level.count(),
      centresWithWebsite: await prisma.tuitionCentre.count({
        where: { website: { not: null } },
      }),
      centresBySubject: {
        Mathematics: await prisma.tuitionCentre.count({
          where: {
            subjects: {
              some: {
                subject: { name: 'Mathematics' },
              },
            },
          },
        }),
        Physics: await prisma.tuitionCentre.count({
          where: {
            subjects: {
              some: {
                subject: { name: 'Physics' },
              },
            },
          },
        }),
        Chemistry: await prisma.tuitionCentre.count({
          where: {
            subjects: {
              some: {
                subject: { name: 'Chemistry' },
              },
            },
          },
        }),
        English: await prisma.tuitionCentre.count({
          where: {
            subjects: {
              some: {
                subject: { name: 'English' },
              },
            },
          },
        }),
      },
      centresByLevel: {
        'Primary 6': await prisma.tuitionCentre.count({
          where: {
            levels: {
              some: {
                level: { name: 'Primary 6' },
              },
            },
          },
        }),
        'Secondary 4': await prisma.tuitionCentre.count({
          where: {
            levels: {
              some: {
                level: { name: 'Secondary 4' },
              },
            },
          },
        }),
        'JC 2': await prisma.tuitionCentre.count({
          where: {
            levels: {
              some: {
                level: { name: 'JC 2' },
              },
            },
          },
        }),
      },
    };
    
    console.log(JSON.stringify(stats, null, 2));
    console.log('\n');
    
    console.log('='.repeat(80));
    console.log('✅ Sample responses generated successfully');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

showSampleResponses();
