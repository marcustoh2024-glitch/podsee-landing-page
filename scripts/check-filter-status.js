/**
 * Check Filter System Status
 * 
 * Quick diagnostic script to check if filters are ready to enable
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  console.log('🔍 Checking filter system status...\n');
  
  try {
    // Check feature flag
    const featureFlag = process.env.ENABLE_OFFERING_FILTERS;
    console.log('📋 Configuration:');
    console.log(`   ENABLE_OFFERING_FILTERS: ${featureFlag || '(not set)'}`);
    console.log('');
    
    // Check database counts
    const [centresCount, offeringsCount, levelsCount, subjectsCount] = await Promise.all([
      prisma.tuitionCentre.count(),
      prisma.offering.count(),
      prisma.level.count(),
      prisma.subject.count()
    ]);
    
    console.log('📊 Database Status:');
    console.log(`   Centres: ${centresCount}`);
    console.log(`   Offerings: ${offeringsCount}`);
    console.log(`   Levels: ${levelsCount}`);
    console.log(`   Subjects: ${subjectsCount}`);
    console.log('');
    
    // Check if filters would be enabled
    const flagEnabled = featureFlag === 'true';
    const hasOfferings = offeringsCount > 0;
    const filtersEnabled = flagEnabled && hasOfferings;
    
    console.log('🚦 Filter Status:');
    console.log(`   Feature flag enabled: ${flagEnabled ? '✅' : '❌'}`);
    console.log(`   Offerings exist: ${hasOfferings ? '✅' : '❌'}`);
    console.log(`   Filters enabled: ${filtersEnabled ? '✅ YES' : '❌ NO'}`);
    console.log('');
    
    if (!filtersEnabled) {
      console.log('⚠️  Filters are currently DISABLED\n');
      
      if (!flagEnabled) {
        console.log('To enable filters:');
        console.log('1. Set ENABLE_OFFERING_FILTERS="true" in .env');
      }
      
      if (!hasOfferings) {
        console.log('2. Populate offerings data:');
        console.log('   node scripts/populate-offerings.js');
      }
      
      console.log('3. Restart the dev server');
      console.log('');
    } else {
      console.log('✅ Filters are ENABLED and ready to use!\n');
      
      // Show sample of available options
      const [sampleLevels, sampleSubjects] = await Promise.all([
        prisma.level.findMany({
          where: {
            offerings: {
              some: {}
            }
          },
          select: { name: true },
          take: 5
        }),
        prisma.subject.findMany({
          where: {
            offerings: {
              some: {}
            }
          },
          select: { name: true },
          take: 5
        })
      ]);
      
      console.log('📝 Available Filter Options (sample):');
      console.log(`   Levels: ${sampleLevels.map(l => l.name).join(', ')}${sampleLevels.length === 5 ? '...' : ''}`);
      console.log(`   Subjects: ${sampleSubjects.map(s => s.name).join(', ')}${sampleSubjects.length === 5 ? '...' : ''}`);
      console.log('');
      
      // Show sample offering
      const sampleOffering = await prisma.offering.findFirst({
        include: {
          tuitionCentre: true,
          level: true,
          subject: true
        }
      });
      
      if (sampleOffering) {
        console.log('📌 Sample Offering:');
        console.log(`   Centre: ${sampleOffering.tuitionCentre.name}`);
        console.log(`   Level: ${sampleOffering.level.name}`);
        console.log(`   Subject: ${sampleOffering.subject.name}`);
        console.log('');
      }
    }
    
    // Check for centres without offerings
    const centresWithoutOfferings = await prisma.tuitionCentre.count({
      where: {
        offerings: {
          none: {}
        }
      }
    });
    
    if (centresWithoutOfferings > 0) {
      console.log(`⚠️  ${centresWithoutOfferings} centres have no offerings`);
      console.log('   These centres will be excluded when filters are applied');
      console.log('   They will still appear when no filters are selected');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();
