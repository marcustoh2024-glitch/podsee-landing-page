#!/usr/bin/env node

/**
 * Verify Offerings Ingestion
 * 
 * Checks that offerings data was successfully imported
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 Verifying Offerings Ingestion\n');
    
    // Get counts
    const [levels, subjects, offerings, centres] = await Promise.all([
      prisma.level.findMany({ orderBy: { name: 'asc' } }),
      prisma.subject.findMany({ orderBy: { name: 'asc' } }),
      prisma.offering.count(),
      prisma.tuitionCentre.count()
    ]);
    
    console.log('📊 Database Counts:');
    console.log(`   Tuition Centres: ${centres}`);
    console.log(`   Levels: ${levels.length}`);
    console.log(`   Subjects: ${subjects.length}`);
    console.log(`   Offerings: ${offerings}\n`);
    
    console.log('📚 Available Levels:');
    console.log(`   ${levels.map(l => l.name).join(', ')}\n`);
    
    console.log('📖 Available Subjects:');
    console.log(`   ${subjects.map(s => s.name).join(', ')}\n`);
    
    // Sample offerings
    const sampleOfferings = await prisma.offering.findMany({
      take: 8,
      include: {
        tuitionCentre: true,
        level: true,
        subject: true
      }
    });
    
    console.log('🔗 Sample Offerings:');
    sampleOfferings.forEach(o => {
      console.log(`   • ${o.tuitionCentre.name}: ${o.level.name} + ${o.subject.name}`);
    });
    console.log('');
    
    // Check centres with offerings
    const centresWithOfferings = await prisma.tuitionCentre.findMany({
      where: {
        offerings: {
          some: {}
        }
      },
      select: {
        name: true,
        _count: {
          select: { offerings: true }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 8
    });
    
    console.log('🏢 Centres with Offerings:');
    centresWithOfferings.forEach(c => {
      console.log(`   • ${c.name}: ${c._count.offerings} offerings`);
    });
    console.log('');
    
    // Check if filters can be enabled
    const canEnableFilters = levels.length > 0 && subjects.length > 0 && offerings > 0;
    
    if (canEnableFilters) {
      console.log('✅ FILTERS CAN BE ENABLED');
      console.log('   All required data is present:\n');
      console.log(`   ✓ ${levels.length} levels available`);
      console.log(`   ✓ ${subjects.length} subjects available`);
      console.log(`   ✓ ${offerings} offerings created`);
      console.log('');
      console.log('   Next steps:');
      console.log('   1. Update /api/filter-options to return enabled: true');
      console.log('   2. Update service layer to use offerings for filtering');
      console.log('   3. Test filter combinations\n');
    } else {
      console.log('❌ FILTERS CANNOT BE ENABLED YET');
      console.log('   Missing data:\n');
      if (levels.length === 0) console.log('   ✗ No levels found');
      if (subjects.length === 0) console.log('   ✗ No subjects found');
      if (offerings === 0) console.log('   ✗ No offerings found');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
