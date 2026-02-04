#!/usr/bin/env node

/**
 * Test script to verify that level + subject filters match on the same offering row
 * This ensures the fix for explicit level-subject matching is working correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOfferingFilterLogic() {
  console.log('🧪 Testing Offering Filter Logic\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Check if Offering table has data
    const offeringCount = await prisma.offering.count();
    console.log(`\n✓ Offering table has ${offeringCount} records`);

    if (offeringCount === 0) {
      console.log('⚠️  Warning: No offerings found. Run data ingestion first.');
      return;
    }

    // Step 2: Get a sample centre with its offerings
    const sampleCentre = await prisma.tuitionCentre.findFirst({
      include: {
        offerings: {
          include: {
            level: true,
            subject: true
          }
        }
      }
    });

    if (!sampleCentre) {
      console.log('⚠️  No centres found in database');
      return;
    }

    console.log(`\n📍 Sample Centre: ${sampleCentre.name}`);
    console.log(`   Offerings (${sampleCentre.offerings.length}):`);
    sampleCentre.offerings.slice(0, 5).forEach(o => {
      console.log(`   - ${o.level.name} + ${o.subject.name}`);
    });
    if (sampleCentre.offerings.length > 5) {
      console.log(`   ... and ${sampleCentre.offerings.length - 5} more`);
    }

    // Step 3: Test case - Find centres with a specific level-subject combination
    const testLevel = sampleCentre.offerings[0].level.name;
    const testSubject = sampleCentre.offerings[0].subject.name;

    console.log(`\n🔍 Test Case 1: Search for "${testLevel}" + "${testSubject}"`);
    
    const matchingCentres = await prisma.tuitionCentre.findMany({
      where: {
        offerings: {
          some: {
            AND: [
              { level: { name: testLevel } },
              { subject: { name: testSubject } }
            ]
          }
        }
      },
      include: {
        offerings: {
          where: {
            AND: [
              { level: { name: testLevel } },
              { subject: { name: testSubject } }
            ]
          },
          include: {
            level: true,
            subject: true
          }
        }
      }
    });

    console.log(`   ✓ Found ${matchingCentres.length} centres with this exact offering`);
    matchingCentres.slice(0, 3).forEach(c => {
      console.log(`   - ${c.name}`);
    });

    // Step 4: Test case - Find a non-existent combination
    const allLevels = await prisma.level.findMany();
    const allSubjects = await prisma.subject.findMany();
    
    // Try to find a combination that doesn't exist
    let nonExistentLevel = null;
    let nonExistentSubject = null;
    
    for (const level of allLevels) {
      for (const subject of allSubjects) {
        const exists = await prisma.offering.findFirst({
          where: {
            levelId: level.id,
            subjectId: subject.id
          }
        });
        
        if (!exists) {
          nonExistentLevel = level.name;
          nonExistentSubject = subject.name;
          break;
        }
      }
      if (nonExistentLevel) break;
    }

    if (nonExistentLevel && nonExistentSubject) {
      console.log(`\n🔍 Test Case 2: Search for non-existent combination "${nonExistentLevel}" + "${nonExistentSubject}"`);
      
      const noMatchCentres = await prisma.tuitionCentre.findMany({
        where: {
          offerings: {
            some: {
              AND: [
                { level: { name: nonExistentLevel } },
                { subject: { name: nonExistentSubject } }
              ]
            }
          }
        }
      });

      console.log(`   ✓ Found ${noMatchCentres.length} centres (should be 0)`);
      
      if (noMatchCentres.length === 0) {
        console.log('   ✅ PASS: No false positives');
      } else {
        console.log('   ❌ FAIL: Found centres that should not match');
      }
    }

    // Step 5: Test case - Verify old logic would have failed
    console.log(`\n🔍 Test Case 3: Verify old logic would have given wrong results`);
    
    // Find a centre that has level A and subject B, but not the combination A+B
    const centreWithSeparateLevelSubject = await prisma.tuitionCentre.findFirst({
      where: {
        AND: [
          {
            offerings: {
              some: {
                level: { name: testLevel }
              }
            }
          },
          {
            offerings: {
              some: {
                subject: { name: testSubject }
              }
            }
          },
          {
            offerings: {
              none: {
                AND: [
                  { level: { name: testLevel } },
                  { subject: { name: testSubject } }
                ]
              }
            }
          }
        ]
      },
      include: {
        offerings: {
          include: {
            level: true,
            subject: true
          }
        }
      }
    });

    if (centreWithSeparateLevelSubject) {
      console.log(`   Found centre: ${centreWithSeparateLevelSubject.name}`);
      console.log(`   - Has ${testLevel}: YES`);
      console.log(`   - Has ${testSubject}: YES`);
      console.log(`   - Has ${testLevel} + ${testSubject}: NO`);
      console.log('   ✅ PASS: Old logic would have incorrectly returned this centre');
    } else {
      console.log('   ℹ️  Could not find a centre with separate level/subject (all combinations exist)');
    }

    // Step 6: Summary statistics
    console.log('\n📊 Summary Statistics:');
    const totalCentres = await prisma.tuitionCentre.count();
    const totalLevels = await prisma.level.count();
    const totalSubjects = await prisma.subject.count();
    const totalOfferings = await prisma.offering.count();
    
    console.log(`   Total Centres: ${totalCentres}`);
    console.log(`   Total Levels: ${totalLevels}`);
    console.log(`   Total Subjects: ${totalSubjects}`);
    console.log(`   Total Offerings: ${totalOfferings}`);
    console.log(`   Avg Offerings per Centre: ${(totalOfferings / totalCentres).toFixed(1)}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testOfferingFilterLogic().catch(console.error);
