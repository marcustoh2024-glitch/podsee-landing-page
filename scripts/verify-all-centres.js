/**
 * Verify All Centres Ingestion
 * 
 * Quick verification script to confirm all centres were inserted
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('='.repeat(80));
    console.log('VERIFICATION REPORT');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Count total centres
    const totalCentres = await prisma.tuitionCentre.count();
    console.log(`Total centres in database: ${totalCentres}\n`);
    
    // Count by quality status
    const okCount = await prisma.tuitionCentre.count({
      where: { dataQualityStatus: 'OK' }
    });
    
    const needsReviewCount = await prisma.tuitionCentre.count({
      where: { dataQualityStatus: 'NEEDS_REVIEW' }
    });
    
    console.log('Quality Status Distribution:');
    console.log(`  OK:            ${okCount} (${(okCount/totalCentres*100).toFixed(1)}%)`);
    console.log(`  NEEDS_REVIEW:  ${needsReviewCount} (${(needsReviewCount/totalCentres*100).toFixed(1)}%)`);
    console.log('\n');
    
    // Sample centres with OK status
    console.log('Sample centres with OK status:');
    const okCentres = await prisma.tuitionCentre.findMany({
      where: { dataQualityStatus: 'OK' },
      include: {
        subjects: { include: { subject: true } },
        levels: { include: { level: true } }
      },
      take: 5
    });
    
    okCentres.forEach(centre => {
      console.log(`  ✅ ${centre.name}`);
      console.log(`     Subjects: ${centre.subjects.length}, Levels: ${centre.levels.length}`);
    });
    console.log('\n');
    
    // Sample centres with NEEDS_REVIEW status
    console.log('Sample centres with NEEDS_REVIEW status:');
    const reviewCentres = await prisma.tuitionCentre.findMany({
      where: { dataQualityStatus: 'NEEDS_REVIEW' },
      include: {
        subjects: { include: { subject: true } },
        levels: { include: { level: true } }
      },
      take: 5
    });
    
    reviewCentres.forEach(centre => {
      console.log(`  ⚠️  ${centre.name}`);
      console.log(`     Subjects: ${centre.subjects.length}, Levels: ${centre.levels.length}`);
      const notes = centre.dataQualityNotes?.substring(0, 100);
      console.log(`     Issues: ${notes}${centre.dataQualityNotes?.length > 100 ? '...' : ''}`);
    });
    console.log('\n');
    
    // Centres with no subjects
    const noSubjects = await prisma.tuitionCentre.findMany({
      where: {
        subjects: { none: {} }
      },
      select: { name: true }
    });
    
    console.log(`Centres with no subjects: ${noSubjects.length}`);
    noSubjects.forEach(centre => {
      console.log(`  - ${centre.name}`);
    });
    console.log('\n');
    
    // Centres with no levels
    const noLevels = await prisma.tuitionCentre.findMany({
      where: {
        levels: { none: {} }
      },
      select: { name: true }
    });
    
    console.log(`Centres with no levels: ${noLevels.length}`);
    noLevels.forEach(centre => {
      console.log(`  - ${centre.name}`);
    });
    console.log('\n');
    
    console.log('='.repeat(80));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
