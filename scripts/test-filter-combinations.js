/**
 * Test Filter Combinations
 * 
 * This script tests various filter combinations to identify
 * what causes 0 results in the UI
 */

import { prisma } from '../src/lib/prisma.js';

async function testFilterCombinations() {
  console.log('═'.repeat(80));
  console.log('FILTER COMBINATION TESTING');
  console.log('═'.repeat(80));
  console.log('\n');
  
  try {
    // ========================================================================
    // TEST 1: Check location values in database
    // ========================================================================
    console.log('📍 TEST 1: LOCATION VALUES IN DATABASE\n');
    console.log('─'.repeat(80));
    
    const locations = await prisma.tuitionCentre.findMany({
      select: { location: true },
      distinct: ['location']
    });
    
    console.log(`Found ${locations.length} distinct location(s):`);
    for (const loc of locations) {
      const count = await prisma.tuitionCentre.count({
        where: { location: loc.location }
      });
      console.log(`  - "${loc.location}": ${count} centres`);
    }
    
    // Test exact match
    const marineParadeExact = await prisma.tuitionCentre.count({
      where: { location: 'Marine Parade' }
    });
    console.log(`\nExact match "Marine Parade": ${marineParadeExact} centres`);
    
    // Test contains
    const marineParadeContains = await prisma.tuitionCentre.count({
      where: { location: { contains: 'Marine Parade' } }
    });
    console.log(`Contains "Marine Parade": ${marineParadeContains} centres`);
    
    console.log('\n');
    
    // ========================================================================
    // TEST 2: Check level values in database
    // ========================================================================
    console.log('🎓 TEST 2: LEVEL VALUES IN DATABASE\n');
    console.log('─'.repeat(80));
    
    const levels = await prisma.level.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${levels.length} levels in database:`);
    levels.forEach(level => {
      console.log(`  - ID: ${level.id}, Name: "${level.name}"`);
    });
    
    // Check for "Secondary" level
    const secondaryLevel = await prisma.level.findFirst({
      where: { name: 'Secondary' }
    });
    console.log(`\nLevel named "Secondary": ${secondaryLevel ? 'EXISTS' : 'NOT FOUND'}`);
    
    // Check for Secondary 1-4
    const secondaryLevels = await prisma.level.findMany({
      where: {
        name: {
          in: ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']
        }
      }
    });
    console.log(`Secondary 1-4 levels: ${secondaryLevels.length} found`);
    secondaryLevels.forEach(l => console.log(`  - ${l.name}`));
    
    // Count centres with any secondary level
    const centresWithSecondary = await prisma.tuitionCentre.findMany({
      where: {
        levels: {
          some: {
            level: {
              name: {
                in: ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']
              }
            }
          }
        }
      },
      select: { id: true, name: true }
    });
    console.log(`\nCentres with Secondary 1-4: ${centresWithSecondary.length}`);
    
    console.log('\n');
    
    // ========================================================================
    // TEST 3: Check subject values in database
    // ========================================================================
    console.log('📚 TEST 3: SUBJECT VALUES IN DATABASE\n');
    console.log('─'.repeat(80));
    
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${subjects.length} subjects in database:`);
    subjects.forEach(subject => {
      console.log(`  - ID: ${subject.id}, Name: "${subject.name}"`);
    });
    
    // Check for "English" subject
    const englishSubject = await prisma.subject.findFirst({
      where: { name: 'English' }
    });
    console.log(`\nSubject named "English": ${englishSubject ? `EXISTS (ID: ${englishSubject.id})` : 'NOT FOUND'}`);
    
    // Count centres with English
    if (englishSubject) {
      const centresWithEnglish = await prisma.tuitionCentre.count({
        where: {
          subjects: {
            some: {
              subjectId: englishSubject.id
            }
          }
        }
      });
      console.log(`Centres offering English: ${centresWithEnglish}`);
    }
    
    console.log('\n');
    
    // ========================================================================
    // TEST 4: Combined filter - Location + Secondary + English
    // ========================================================================
    console.log('🔍 TEST 4: COMBINED FILTER TEST\n');
    console.log('─'.repeat(80));
    console.log('Filter: Location="Marine Parade" + Level=Secondary + Subject=English\n');
    
    // Get English subject and Secondary levels
    const english = await prisma.subject.findFirst({
      where: { name: 'English' }
    });
    
    const secondaryLevelIds = await prisma.level.findMany({
      where: {
        name: {
          in: ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']
        }
      },
      select: { id: true }
    });
    
    if (english && secondaryLevelIds.length > 0) {
      const combinedResults = await prisma.tuitionCentre.findMany({
        where: {
          location: 'Marine Parade',
          AND: [
            {
              subjects: {
                some: {
                  subjectId: english.id
                }
              }
            },
            {
              levels: {
                some: {
                  levelId: {
                    in: secondaryLevelIds.map(l => l.id)
                  }
                }
              }
            }
          ]
        },
        include: {
          subjects: { include: { subject: true } },
          levels: { include: { level: true } }
        }
      });
      
      console.log(`Results: ${combinedResults.length} centres found`);
      
      if (combinedResults.length > 0) {
        console.log('\nMatching centres:');
        combinedResults.forEach((centre, i) => {
          console.log(`\n${i + 1}. ${centre.name}`);
          console.log(`   Location: ${centre.location}`);
          console.log(`   Subjects: ${centre.subjects.map(s => s.subject.name).join(', ')}`);
          console.log(`   Levels: ${centre.levels.map(l => l.level.name).join(', ')}`);
        });
      } else {
        console.log('\n❌ NO CENTRES MATCH ALL THREE FILTERS');
        
        // Debug: Check each filter individually
        console.log('\nDebug - Testing filters individually:');
        
        const locationOnly = await prisma.tuitionCentre.count({
          where: { location: 'Marine Parade' }
        });
        console.log(`  Location only: ${locationOnly} centres`);
        
        const englishOnly = await prisma.tuitionCentre.count({
          where: {
            subjects: {
              some: { subjectId: english.id }
            }
          }
        });
        console.log(`  English only: ${englishOnly} centres`);
        
        const secondaryOnly = await prisma.tuitionCentre.count({
          where: {
            levels: {
              some: {
                levelId: {
                  in: secondaryLevelIds.map(l => l.id)
                }
              }
            }
          }
        });
        console.log(`  Secondary only: ${secondaryOnly} centres`);
        
        const locationAndEnglish = await prisma.tuitionCentre.count({
          where: {
            location: 'Marine Parade',
            subjects: {
              some: { subjectId: english.id }
            }
          }
        });
        console.log(`  Location + English: ${locationAndEnglish} centres`);
        
        const locationAndSecondary = await prisma.tuitionCentre.count({
          where: {
            location: 'Marine Parade',
            levels: {
              some: {
                levelId: {
                  in: secondaryLevelIds.map(l => l.id)
                }
              }
            }
          }
        });
        console.log(`  Location + Secondary: ${locationAndSecondary} centres`);
        
        const englishAndSecondary = await prisma.tuitionCentre.count({
          where: {
            subjects: {
              some: { subjectId: english.id }
            },
            levels: {
              some: {
                levelId: {
                  in: secondaryLevelIds.map(l => l.id)
                }
              }
            }
          }
        });
        console.log(`  English + Secondary: ${englishAndSecondary} centres`);
      }
    }
    
    console.log('\n');
    
    // ========================================================================
    // TEST 5: Test with different level formats
    // ========================================================================
    console.log('🔍 TEST 5: TEST DIFFERENT LEVEL FORMATS\n');
    console.log('─'.repeat(80));
    
    // Test if UI might be sending "Secondary" as a single value
    const levelSecondary = await prisma.level.findFirst({
      where: { name: 'Secondary' }
    });
    
    if (levelSecondary) {
      console.log('Found level "Secondary" in database');
      const count = await prisma.tuitionCentre.count({
        where: {
          levels: {
            some: {
              levelId: levelSecondary.id
            }
          }
        }
      });
      console.log(`Centres with level "Secondary": ${count}`);
    } else {
      console.log('❌ No level named "Secondary" found');
      console.log('   UI might be sending "Secondary" but DB has "Secondary 1", "Secondary 2", etc.');
    }
    
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFilterCombinations();
