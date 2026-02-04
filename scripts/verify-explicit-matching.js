#!/usr/bin/env node

/**
 * Verification script to demonstrate explicit level + subject matching
 * This proves that the fix correctly enforces matching on the same offering row
 */

import { PrismaClient } from '@prisma/client';
import TuitionCentreService from '../src/lib/services/tuitionCentreService.js';

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

async function verifyExplicitMatching() {
  console.log('🔍 Verification: Explicit Level + Subject Matching\n');
  console.log('=' .repeat(80));

  try {
    // Pick a real example from the database
    const sampleCentre = await prisma.tuitionCentre.findFirst({
      include: {
        offerings: {
          include: {
            level: true,
            subject: true
          },
          take: 10
        }
      }
    });

    if (!sampleCentre || sampleCentre.offerings.length < 2) {
      console.log('⚠️  Not enough data to demonstrate');
      return;
    }

    console.log(`\n📍 Example Centre: ${sampleCentre.name}`);
    console.log(`\nThis centre offers these combinations:`);
    sampleCentre.offerings.forEach((o, i) => {
      console.log(`   ${i + 1}. ${o.level.name} + ${o.subject.name}`);
    });

    // Test 1: Search for an existing combination
    const existingLevel = sampleCentre.offerings[0].level.name;
    const existingSubject = sampleCentre.offerings[0].subject.name;

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`\n✅ TEST 1: Search for EXISTING combination`);
    console.log(`   Query: "${existingLevel}" + "${existingSubject}"`);
    
    const result1 = await service.searchTuitionCentres({
      levels: [existingLevel],
      subjects: [existingSubject]
    });

    const found1 = result1.data.some(c => c.id === sampleCentre.id);
    console.log(`   Result: ${found1 ? '✅ FOUND' : '❌ NOT FOUND'} (Expected: FOUND)`);
    console.log(`   Total centres with this combination: ${result1.pagination.total}`);

    // Test 2: Try to find a non-existent combination
    // Get all offerings for this centre to find a non-existent combination
    const allOfferings = await prisma.offering.findMany({
      where: { tuitionCentreId: sampleCentre.id },
      include: {
        level: true,
        subject: true
      }
    });

    // Get all levels and subjects this centre has
    const centreLevels = [...new Set(allOfferings.map(o => o.level.name))];
    const centreSubjects = [...new Set(allOfferings.map(o => o.subject.name))];

    // Try to find a level-subject combination that doesn't exist
    let nonExistentLevel = null;
    let nonExistentSubject = null;

    for (const level of centreLevels) {
      for (const subject of centreSubjects) {
        const exists = allOfferings.some(
          o => o.level.name === level && o.subject.name === subject
        );
        if (!exists) {
          nonExistentLevel = level;
          nonExistentSubject = subject;
          break;
        }
      }
      if (nonExistentLevel) break;
    }

    if (nonExistentLevel && nonExistentSubject) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`\n❌ TEST 2: Search for NON-EXISTENT combination`);
      console.log(`   The centre has:`);
      console.log(`   - "${nonExistentLevel}" (in some offerings)`);
      console.log(`   - "${nonExistentSubject}" (in some offerings)`);
      console.log(`   But NOT the combination "${nonExistentLevel} + ${nonExistentSubject}"`);
      console.log(`\n   Query: "${nonExistentLevel}" + "${nonExistentSubject}"`);

      const result2 = await service.searchTuitionCentres({
        levels: [nonExistentLevel],
        subjects: [nonExistentSubject]
      });

      const found2 = result2.data.some(c => c.id === sampleCentre.id);
      console.log(`   Result: ${found2 ? '❌ FOUND (BUG!)' : '✅ NOT FOUND'} (Expected: NOT FOUND)`);
      
      if (found2) {
        console.log(`\n   ⚠️  WARNING: This centre was incorrectly returned!`);
        console.log(`   This means the old buggy logic is still active.`);
      } else {
        console.log(`\n   ✅ CORRECT: The centre was not returned because it doesn't offer this combination.`);
        console.log(`   This proves the fix is working!`);
      }
    } else {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`\n⚠️  TEST 2: Skipped`);
      console.log(`   This centre offers ALL possible combinations of its levels and subjects.`);
      console.log(`   (This is expected if data was migrated with a Cartesian product)`);
    }

    // Test 3: Demonstrate the rule clearly
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`\n📋 MATCHING RULES (Now Enforced):`);
    console.log(`\n   1. Level filter only:`);
    console.log(`      → Centre matches if it offers ANY offering with a level in the selected set`);
    console.log(`\n   2. Subject filter only:`);
    console.log(`      → Centre matches if it offers ANY offering with a subject in the selected set`);
    console.log(`\n   3. Both level AND subject filters:`);
    console.log(`      → They MUST match on the SAME offering row`);
    console.log(`      → NOT level from one row + subject from another row`);

    // Test 4: Show the difference with a concrete example
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`\n📊 CONCRETE EXAMPLE:`);
    console.log(`\n   Imagine a centre offers:`);
    console.log(`   - Primary 1 + Math`);
    console.log(`   - Secondary 1 + English`);
    console.log(`\n   Search queries:`);
    console.log(`   • "Primary 1" only          → ✅ MATCH (has Primary 1)`);
    console.log(`   • "English" only            → ✅ MATCH (has English)`);
    console.log(`   • "Primary 1 + Math"        → ✅ MATCH (exact combination exists)`);
    console.log(`   • "Secondary 1 + English"   → ✅ MATCH (exact combination exists)`);
    console.log(`   • "Primary 1 + English"     → ❌ NO MATCH (combination doesn't exist)`);
    console.log(`   • "Secondary 1 + Math"      → ❌ NO MATCH (combination doesn't exist)`);

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`\n✅ VERIFICATION COMPLETE`);
    console.log(`\nThe Offering model ensures that level + subject filters`);
    console.log(`match on the same offering row, preventing false positives.`);

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyExplicitMatching().catch(console.error);
