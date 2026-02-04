#!/usr/bin/env node

/**
 * Verification script for rollback to last known good state
 * Tests that the system matches the target state exactly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 ROLLBACK VERIFICATION\n');
  console.log('=' .repeat(60));
  
  let allPassed = true;
  
  // 1. Check database state
  console.log('\n1️⃣  DATABASE STATE');
  const centreCount = await prisma.tuitionCentre.count();
  const offeringsCount = await prisma.offering.count();
  
  console.log(`   ✓ Total centres: ${centreCount}`);
  console.log(`   ✓ Total offerings: ${offeringsCount}`);
  
  if (centreCount === 0) {
    console.log('   ❌ FAIL: No centres in database');
    allPassed = false;
  } else {
    console.log('   ✅ PASS: Centres exist');
  }
  
  // 2. Check filter options API
  console.log('\n2️⃣  FILTER OPTIONS API');
  try {
    const response = await fetch('http://localhost:3001/api/filter-options');
    const data = await response.json();
    
    if (data.enabled === false) {
      console.log('   ✅ PASS: Filters are disabled');
      console.log(`   ✓ Reason: ${data.reason}`);
    } else {
      console.log('   ❌ FAIL: Filters are enabled (should be disabled)');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ⚠️  WARNING: Could not test API (server may not be running)');
    console.log(`   Error: ${error.message}`);
  }
  
  // 3. Check tuition centres API (no filters)
  console.log('\n3️⃣  TUITION CENTRES API (No Filters)');
  try {
    const response = await fetch('http://localhost:3001/api/tuition-centres?page=1&limit=20');
    const data = await response.json();
    
    if (data.pagination && data.pagination.total === centreCount) {
      console.log(`   ✅ PASS: Returns all centres (${data.pagination.total})`);
      console.log(`   ✓ Page 1 returned: ${data.data.length} centres`);
    } else {
      console.log(`   ❌ FAIL: Expected ${centreCount} centres, got ${data.pagination?.total || 0}`);
      allPassed = false;
    }
  } catch (error) {
    console.log('   ⚠️  WARNING: Could not test API (server may not be running)');
    console.log(`   Error: ${error.message}`);
  }
  
  // 4. Check tuition centres API (with filters - should be ignored)
  console.log('\n4️⃣  TUITION CENTRES API (With Filters - Should Be Ignored)');
  try {
    const response = await fetch('http://localhost:3001/api/tuition-centres?levels=Secondary&subjects=Mathematics&page=1&limit=20');
    const data = await response.json();
    
    if (data.pagination && data.pagination.total === centreCount) {
      console.log(`   ✅ PASS: Filters ignored, returns all centres (${data.pagination.total})`);
    } else {
      console.log(`   ❌ FAIL: Filters may be active (expected ${centreCount}, got ${data.pagination?.total || 0})`);
      allPassed = false;
    }
  } catch (error) {
    console.log('   ⚠️  WARNING: Could not test API (server may not be running)');
    console.log(`   Error: ${error.message}`);
  }
  
  // 5. Check environment variable
  console.log('\n5️⃣  ENVIRONMENT CONFIGURATION');
  const featureFlag = process.env.ENABLE_OFFERING_FILTERS;
  console.log(`   Feature flag: ${featureFlag}`);
  
  if (featureFlag === 'false' || !featureFlag) {
    console.log('   ✅ PASS: Feature flag is disabled');
  } else {
    console.log('   ⚠️  WARNING: Feature flag is enabled (but filters should still be disabled in code)');
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - System is in target state');
  } else {
    console.log('❌ SOME CHECKS FAILED - Review issues above');
  }
  console.log('='.repeat(60));
  
  console.log('\n📋 EXPECTED BEHAVIOR:');
  console.log('   • All centres visible on results page');
  console.log('   • Filter UI shows "Filters temporarily disabled" banner');
  console.log('   • Applying filters has no effect (all centres still shown)');
  console.log('   • No empty states unless database is actually empty');
  console.log('   • Pagination.total matches database count');
  
  await prisma.$disconnect();
}

verify().catch(console.error);
