#!/usr/bin/env node
/**
 * HARD RESET: Wipe all tuition-related data
 * Deletes: TuitionCentres, Offerings, Levels, Subjects, and join tables
 * Preserves: Users, Comments, DiscussionThreads (orphaned but safe)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeData() {
  console.log('🗑️  Starting hard reset of tuition data...\n');

  try {
    // Delete in correct order (respecting foreign keys)
    console.log('Deleting Offerings...');
    const offerings = await prisma.offering.deleteMany({});
    console.log(`✓ Deleted ${offerings.count} offerings`);

    console.log('Deleting TuitionCentreLevel join records...');
    const tcLevels = await prisma.tuitionCentreLevel.deleteMany({});
    console.log(`✓ Deleted ${tcLevels.count} centre-level links`);

    console.log('Deleting TuitionCentreSubject join records...');
    const tcSubjects = await prisma.tuitionCentreSubject.deleteMany({});
    console.log(`✓ Deleted ${tcSubjects.count} centre-subject links`);

    console.log('Deleting TuitionCentres...');
    const centres = await prisma.tuitionCentre.deleteMany({});
    console.log(`✓ Deleted ${centres.count} tuition centres`);

    console.log('Deleting Levels...');
    const levels = await prisma.level.deleteMany({});
    console.log(`✓ Deleted ${levels.count} levels`);

    console.log('Deleting Subjects...');
    const subjects = await prisma.subject.deleteMany({});
    console.log(`✓ Deleted ${subjects.count} subjects`);

    console.log('\n✅ Hard reset complete. Verifying counts...\n');

    // Verify everything is zero
    const verification = {
      centres: await prisma.tuitionCentre.count(),
      offerings: await prisma.offering.count(),
      levels: await prisma.level.count(),
      subjects: await prisma.subject.count(),
      centreLevels: await prisma.tuitionCentreLevel.count(),
      centreSubjects: await prisma.tuitionCentreSubject.count(),
    };

    console.log('Current counts:');
    console.log(`  Centres: ${verification.centres}`);
    console.log(`  Offerings: ${verification.offerings}`);
    console.log(`  Levels: ${verification.levels}`);
    console.log(`  Subjects: ${verification.subjects}`);
    console.log(`  Centre-Level links: ${verification.centreLevels}`);
    console.log(`  Centre-Subject links: ${verification.centreSubjects}`);

    const allZero = Object.values(verification).every(count => count === 0);
    
    if (allZero) {
      console.log('\n✅ VERIFICATION PASSED: All tuition data wiped successfully');
    } else {
      console.log('\n⚠️  WARNING: Some data remains. Check foreign key constraints.');
    }

  } catch (error) {
    console.error('❌ Error during wipe:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

wipeData();
