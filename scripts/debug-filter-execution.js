const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugFilterExecution() {
  console.log('═'.repeat(80));
  console.log('FILTER EXECUTION DEBUG');
  console.log('═'.repeat(80));
  console.log('\n');

  // Test Case 1: No filters
  console.log('TEST 1: No filters (should return all 60 centres)');
  console.log('─'.repeat(80));
  const noFilterCount = await prisma.tuitionCentre.count();
  console.log('✓ Result:', noFilterCount, 'centres\n');

  // Test Case 2: JC filter only
  console.log('TEST 2: JC filter only');
  console.log('─'.repeat(80));
  
  // Expand JC to JC 1, JC 2
  const jcLevels = ['JC 1', 'JC 2'];
  console.log('Expanded levels:', jcLevels);
  
  const jcOnlyWhere = {
    offerings: {
      some: {
        level: {
          OR: jcLevels.flatMap(level => [
            { id: level },
            { name: { equals: level } }
          ])
        }
      }
    }
  };
  
  console.log('Query:', JSON.stringify(jcOnlyWhere, null, 2));
  const jcOnlyCount = await prisma.tuitionCentre.count({ where: jcOnlyWhere });
  console.log('✓ Result:', jcOnlyCount, 'centres');
  
  // Show sample centres
  const jcSample = await prisma.tuitionCentre.findMany({
    where: jcOnlyWhere,
    take: 3,
    select: { name: true, dataQualityStatus: true }
  });
  console.log('Sample centres:', jcSample.map(c => `${c.name} (${c.dataQualityStatus})`).join(', '));
  console.log('');

  // Test Case 3: English filter only
  console.log('TEST 3: English filter only');
  console.log('─'.repeat(80));
  
  const englishOnlyWhere = {
    offerings: {
      some: {
        subject: {
          OR: [
            { id: 'English' },
            { name: { equals: 'English' } }
          ]
        }
      }
    }
  };
  
  console.log('Query:', JSON.stringify(englishOnlyWhere, null, 2));
  const englishOnlyCount = await prisma.tuitionCentre.count({ where: englishOnlyWhere });
  console.log('✓ Result:', englishOnlyCount, 'centres\n');

  // Test Case 4: JC + English (current implementation)
  console.log('TEST 4: JC + English (current implementation - same offering row)');
  console.log('─'.repeat(80));
  
  const jcEnglishWhere = {
    offerings: {
      some: {
        AND: [
          {
            level: {
              OR: jcLevels.flatMap(level => [
                { id: level },
                { name: { equals: level } }
              ])
            }
          },
          {
            subject: {
              OR: [
                { id: 'English' },
                { name: { equals: 'English' } }
              ]
            }
          }
        ]
      }
    }
  };
  
  console.log('Query:', JSON.stringify(jcEnglishWhere, null, 2));
  const jcEnglishCount = await prisma.tuitionCentre.count({ where: jcEnglishWhere });
  console.log('✓ Result:', jcEnglishCount, 'centres');
  
  // Show which centres match
  const jcEnglishCentres = await prisma.tuitionCentre.findMany({
    where: jcEnglishWhere,
    select: { 
      name: true, 
      dataQualityStatus: true,
      offerings: {
        where: {
          AND: [
            { level: { name: { in: jcLevels } } },
            { subject: { name: 'English' } }
          ]
        },
        include: {
          level: { select: { name: true } },
          subject: { select: { name: true } }
        }
      }
    }
  });
  
  console.log('\nMatching centres:');
  jcEnglishCentres.forEach(c => {
    console.log(`  - ${c.name} (${c.dataQualityStatus})`);
    c.offerings.forEach(o => {
      console.log(`    → ${o.level.name} + ${o.subject.name}`);
    });
  });
  console.log('');

  // Test Case 5: Check data quality status distribution
  console.log('TEST 5: Data quality status check');
  console.log('─'.repeat(80));
  
  const okCentres = await prisma.tuitionCentre.count({ where: { dataQualityStatus: 'OK' } });
  const needsReviewCentres = await prisma.tuitionCentre.count({ where: { dataQualityStatus: 'NEEDS_REVIEW' } });
  
  console.log('OK status:', okCentres);
  console.log('NEEDS_REVIEW status:', needsReviewCentres);
  
  // Check if NEEDS_REVIEW centres have offerings
  const needsReviewWithOfferings = await prisma.tuitionCentre.count({
    where: {
      AND: [
        { dataQualityStatus: 'NEEDS_REVIEW' },
        { offerings: { some: {} } }
      ]
    }
  });
  console.log('NEEDS_REVIEW centres with offerings:', needsReviewWithOfferings);
  
  // Check JC + English among NEEDS_REVIEW
  const needsReviewJcEnglish = await prisma.tuitionCentre.count({
    where: {
      AND: [
        { dataQualityStatus: 'NEEDS_REVIEW' },
        jcEnglishWhere
      ]
    }
  });
  console.log('NEEDS_REVIEW centres with JC + English:', needsReviewJcEnglish);
  console.log('');

  // Test Case 6: Alternative filter approach (separate offerings)
  console.log('TEST 6: Alternative approach - centres with ANY JC offering AND ANY English offering');
  console.log('─'.repeat(80));
  
  const alternativeWhere = {
    AND: [
      {
        offerings: {
          some: {
            level: {
              OR: jcLevels.flatMap(level => [
                { id: level },
                { name: { equals: level } }
              ])
            }
          }
        }
      },
      {
        offerings: {
          some: {
            subject: {
              OR: [
                { id: 'English' },
                { name: { equals: 'English' } }
              ]
            }
          }
        }
      }
    ]
  };
  
  console.log('Query:', JSON.stringify(alternativeWhere, null, 2));
  const alternativeCount = await prisma.tuitionCentre.count({ where: alternativeWhere });
  console.log('✓ Result:', alternativeCount, 'centres');
  console.log('');

  console.log('═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log('Total centres:', noFilterCount);
  console.log('Centres with JC offerings:', jcOnlyCount);
  console.log('Centres with English offerings:', englishOnlyCount);
  console.log('Centres with JC+English (same offering):', jcEnglishCount);
  console.log('Centres with JC+English (separate offerings):', alternativeCount);
  console.log('');
  console.log('INTERPRETATION:');
  console.log('- If "same offering" count is low, it means few centres offer English at JC level');
  console.log('- If "separate offerings" count is higher, centres offer JC (other subjects) + English (other levels)');
  console.log('- Current implementation requires EXACT match on same offering row');
  console.log('');

  await prisma.$disconnect();
}

debugFilterExecution().catch(console.error);
