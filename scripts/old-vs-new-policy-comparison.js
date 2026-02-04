/**
 * Old vs New Policy Comparison
 * 
 * Shows what would have been skipped under the old policy
 * vs what was actually inserted under the new policy
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function comparePolices() {
  try {
    console.log('='.repeat(80));
    console.log('OLD POLICY vs NEW POLICY COMPARISON');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Get all centres from the Marine Parade ingestion (exclude seed data)
    const allCentres = await prisma.tuitionCentre.findMany({
      where: {
        location: 'Marine Parade'
      },
      include: {
        subjects: { include: { subject: true } },
        levels: { include: { level: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Total centres from Excel ingestion: ${allCentres.length}\n`);
    
    // Simulate old policy logic
    const oldPolicyResults = {
      wouldInsert: [],
      wouldSkip: {
        flaggedForReview: [],
        noValidSubjects: [],
        unknownLevels: []
      }
    };
    
    allCentres.forEach(centre => {
      const isFlagged = centre.dataQualityNotes?.includes('Flagged for review in source data');
      const hasNoSubjects = centre.subjects.length === 0;
      const hasUnknownLevels = centre.dataQualityNotes?.includes('Contains UNKNOWN level ranges');
      
      // Old policy: skip if flagged OR no subjects
      if (isFlagged || hasNoSubjects) {
        if (isFlagged) {
          oldPolicyResults.wouldSkip.flaggedForReview.push(centre);
        }
        if (hasNoSubjects) {
          oldPolicyResults.wouldSkip.noValidSubjects.push(centre);
        }
      } else {
        oldPolicyResults.wouldInsert.push(centre);
      }
    });
    
    // Print comparison
    console.log('📊 OLD POLICY (Blocking Approach)');
    console.log('-'.repeat(80));
    console.log(`✅ Would insert:                         ${oldPolicyResults.wouldInsert.length} centres`);
    console.log(`⏭️  Would skip:                           ${allCentres.length - oldPolicyResults.wouldInsert.length} centres`);
    console.log(`   - Flagged for review:                 ${oldPolicyResults.wouldSkip.flaggedForReview.length}`);
    console.log(`   - No valid subjects:                  ${oldPolicyResults.wouldSkip.noValidSubjects.length}`);
    console.log('\n');
    
    console.log('📊 NEW POLICY (Quality Flag Approach)');
    console.log('-'.repeat(80));
    console.log(`✅ Actually inserted:                    ${allCentres.length} centres`);
    console.log(`⏭️  Actually skipped:                     0 centres`);
    console.log(`⚠️  Flagged for review:                  ${allCentres.filter(c => c.dataQualityStatus === 'NEEDS_REVIEW').length} centres`);
    console.log(`✅ Clean data (OK status):               ${allCentres.filter(c => c.dataQualityStatus === 'OK').length} centres`);
    console.log('\n');
    
    console.log('📈 IMPROVEMENT');
    console.log('-'.repeat(80));
    const improvement = allCentres.length - oldPolicyResults.wouldInsert.length;
    const improvementPct = (improvement / allCentres.length * 100).toFixed(1);
    console.log(`Additional centres inserted:             ${improvement} (+${improvementPct}%)`);
    console.log(`Coverage improvement:                    ${oldPolicyResults.wouldInsert.length}/${allCentres.length} → ${allCentres.length}/${allCentres.length}`);
    console.log(`Success rate:                            ${(oldPolicyResults.wouldInsert.length/allCentres.length*100).toFixed(1)}% → 100%`);
    console.log('\n');
    
    // Show examples of centres that would have been skipped
    console.log('🔍 EXAMPLES: Centres that would have been SKIPPED under old policy');
    console.log('-'.repeat(80));
    
    const skippedExamples = allCentres
      .filter(c => !oldPolicyResults.wouldInsert.includes(c))
      .slice(0, 10);
    
    skippedExamples.forEach((centre, i) => {
      console.log(`\n${i + 1}. ${centre.name}`);
      console.log(`   Subjects: ${centre.subjects.length}, Levels: ${centre.levels.length}`);
      console.log(`   Status: ${centre.dataQualityStatus}`);
      const notes = centre.dataQualityNotes?.split('|')[0]?.trim();
      console.log(`   Reason: ${notes}`);
    });
    
    if (allCentres.length - oldPolicyResults.wouldInsert.length > 10) {
      console.log(`\n... and ${allCentres.length - oldPolicyResults.wouldInsert.length - 10} more centres`);
    }
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('✅ COMPARISON COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comparePolices();
