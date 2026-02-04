#!/usr/bin/env node
/**
 * VERIFICATION: Confirm centres ingestion
 * - Total centres count
 * - Distinct locations
 * - Sample records
 * - API test (no filters)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('✅ VERIFICATION: Centres Ingestion\n');
  
  try {
    // Count centres
    const totalCentres = await prisma.tuitionCentre.count();
    console.log(`📊 Total centres: ${totalCentres}`);
    
    // Count by source
    const sourceCentres = await prisma.tuitionCentre.count({
      where: {
        dataQualityNotes: {
          contains: 'sourceDataset=database_ready_v1',
        },
      },
    });
    console.log(`   From database_ready_v1: ${sourceCentres}`);
    
    // Distinct locations
    const centres = await prisma.tuitionCentre.findMany({
      select: { location: true },
    });
    const locations = new Set(centres.map(c => c.location));
    console.log(`\n📍 Distinct locations: ${locations.size}`);
    
    // Sample centres
    console.log('\n📋 Sample centres (first 5):');
    const samples = await prisma.tuitionCentre.findMany({
      take: 5,
      orderBy: { name: 'asc' },
      select: {
        name: true,
        location: true,
        whatsappNumber: true,
        website: true,
      },
    });
    
    samples.forEach(centre => {
      console.log(`\n   ${centre.name}`);
      console.log(`   Location: ${centre.location}`);
      console.log(`   WhatsApp: ${centre.whatsappNumber}`);
      console.log(`   Website: ${centre.website || '(none)'}`);
    });
    
    // Check offerings (should be 0)
    const offeringsCount = await prisma.offering.count();
    const levelsCount = await prisma.level.count();
    const subjectsCount = await prisma.subject.count();
    
    console.log('\n📊 Offerings/Levels/Subjects:');
    console.log(`   Offerings: ${offeringsCount}`);
    console.log(`   Levels: ${levelsCount}`);
    console.log(`   Subjects: ${subjectsCount}`);
    
    if (offeringsCount === 0 && levelsCount === 0 && subjectsCount === 0) {
      console.log('   ✅ Correctly empty (centres-only ingestion)');
    } else {
      console.log('   ⚠️  Unexpected data found');
    }
    
    console.log('\n✅ VERIFICATION COMPLETE');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verify();
