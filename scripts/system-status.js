#!/usr/bin/env node
/**
 * ONE-COMMAND SYSTEM STATUS CHECK
 * Shows if offerings data exists and if filters should be enabled
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSystemStatus() {
  console.log('🔍 SYSTEM STATUS CHECK\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    const [
      totalCentres,
      totalOfferings,
      distinctLevels,
      distinctSubjects
    ] = await Promise.all([
      prisma.tuitionCentre.count(),
      prisma.offering.count(),
      prisma.level.count(),
      prisma.subject.count()
    ]);
    
    console.log('📊 Database Counts:');
    console.log(`   Total centres: ${totalCentres}`);
    console.log(`   Total offerings: ${totalOfferings}`);
    console.log(`   Distinct levels: ${distinctLevels}`);
    console.log(`   Distinct subjects: ${distinctSubjects}`);
    
    console.log('\n🎯 Filter Status:');
    
    if (totalOfferings === 0) {
      console.log('   ❌ FILTERS DISABLED');
      console.log('   Reason: No offerings data in database');
      console.log('   Action: UI must ignore level/subject filters');
      console.log('   Display: Show all centres, hide filter UI');
    } else {
      console.log('   ✅ FILTERS ENABLED');
      console.log(`   Available: ${distinctLevels} levels, ${distinctSubjects} subjects`);
      console.log(`   Matching: ${totalOfferings} level-subject combinations`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    
    await prisma.$disconnect();
    
    // Exit code for scripting
    process.exit(totalOfferings === 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(2);
  }
}

checkSystemStatus();
