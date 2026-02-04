/**
 * Populate Offerings Table from Existing Centre Data
 * 
 * This script creates Offering records based on the existing
 * TuitionCentreLevel and TuitionCentreSubject relationships.
 * 
 * Strategy:
 * - For each centre, create offerings for ALL combinations of its levels and subjects
 * - This assumes that if a centre offers Level X and Subject Y, they offer X+Y together
 * - This is a reasonable assumption for initial data population
 * 
 * Usage:
 *   node scripts/populate-offerings.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateOfferings() {
  console.log('🚀 Starting offerings population...\n');
  
  try {
    // Get all centres with their levels and subjects
    const centres = await prisma.tuitionCentre.findMany({
      include: {
        levels: {
          include: {
            level: true
          }
        },
        subjects: {
          include: {
            subject: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${centres.length} centres\n`);
    
    let totalOfferings = 0;
    let centresWithOfferings = 0;
    let centresSkipped = 0;
    
    for (const centre of centres) {
      const centreLevels = centre.levels.map(l => l.level);
      const centreSubjects = centre.subjects.map(s => s.subject);
      
      // Skip centres with no levels or subjects
      if (centreLevels.length === 0 || centreSubjects.length === 0) {
        console.log(`⏭️  Skipping ${centre.name} (no levels or subjects)`);
        centresSkipped++;
        continue;
      }
      
      // Create offerings for all combinations
      const offerings = [];
      for (const level of centreLevels) {
        for (const subject of centreSubjects) {
          offerings.push({
            tuitionCentreId: centre.id,
            levelId: level.id,
            subjectId: subject.id
          });
        }
      }
      
      // Bulk create offerings (skip duplicates)
      const created = await prisma.offering.createMany({
        data: offerings,
        skipDuplicates: true
      });
      
      console.log(`✅ ${centre.name}: Created ${created.count} offerings (${centreLevels.length} levels × ${centreSubjects.length} subjects)`);
      
      totalOfferings += created.count;
      centresWithOfferings++;
    }
    
    console.log('\n📈 Summary:');
    console.log(`   Centres processed: ${centresWithOfferings}`);
    console.log(`   Centres skipped: ${centresSkipped}`);
    console.log(`   Total offerings created: ${totalOfferings}`);
    
    // Verify the data
    console.log('\n🔍 Verification:');
    const offeringsCount = await prisma.offering.count();
    const distinctLevels = await prisma.level.count({
      where: {
        offerings: {
          some: {}
        }
      }
    });
    const distinctSubjects = await prisma.subject.count({
      where: {
        offerings: {
          some: {}
        }
      }
    });
    
    console.log(`   Total offerings in DB: ${offeringsCount}`);
    console.log(`   Distinct levels with offerings: ${distinctLevels}`);
    console.log(`   Distinct subjects with offerings: ${distinctSubjects}`);
    
    console.log('\n✨ Done! You can now enable filters by setting ENABLE_OFFERING_FILTERS=true');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

populateOfferings();
