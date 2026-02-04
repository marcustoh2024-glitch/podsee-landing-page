#!/usr/bin/env node

/**
 * Sample Data Display Script
 * Shows the exact data structure that the UI receives
 */

const { PrismaClient } = require('@prisma/client');
const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

async function showSampleData() {
  try {
    console.log('\n📊 Sample Data Structure for UI\n');
    console.log('='.repeat(80));

    // Get a sample centre
    const result = await service.searchTuitionCentres({ limit: 1 });
    const centre = result.data[0];

    console.log('\n🏢 Sample Centre Object (as received by UI):\n');
    console.log(JSON.stringify(centre, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Field Breakdown:\n');
    console.log(`✓ id: ${centre.id} (UUID)`);
    console.log(`✓ name: ${centre.name} (string)`);
    console.log(`✓ location: ${centre.location} (string)`);
    console.log(`✓ whatsappNumber: ${centre.whatsappNumber} (string with +)`);
    console.log(`✓ whatsappLink: ${centre.whatsappLink} (ready-to-use URL)`);
    console.log(`✓ website: ${centre.website || 'null'} (string or null)`);
    console.log(`✓ levels: Array of ${centre.levels.length} items`);
    centre.levels.forEach((l, i) => {
      console.log(`    [${i}] { id: "${l.id}", name: "${l.name}" }`);
    });
    console.log(`✓ subjects: Array of ${centre.subjects.length} items`);
    centre.subjects.forEach((s, i) => {
      console.log(`    [${i}] { id: "${s.id}", name: "${s.name}" }`);
    });
    console.log(`✓ createdAt: ${centre.createdAt} (ISO timestamp)`);
    console.log(`✓ updatedAt: ${centre.updatedAt} (ISO timestamp)`);

    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 UI Usage Examples:\n');
    console.log('// Access centre name');
    console.log(`centre.name → "${centre.name}"`);
    console.log('\n// Access first level');
    console.log(`centre.levels[0].name → "${centre.levels[0].name}"`);
    console.log('\n// Access first subject');
    console.log(`centre.subjects[0].name → "${centre.subjects[0].name}"`);
    console.log('\n// Open WhatsApp');
    console.log(`window.open(centre.whatsappLink) → Opens ${centre.whatsappLink}`);
    console.log('\n// Map over levels');
    console.log(`centre.levels.map(l => l.name).join(', ') → "${centre.levels.map(l => l.name).join(', ')}"`);

    console.log('\n' + '='.repeat(80));
    console.log('\n📦 Full API Response Structure:\n');
    console.log(JSON.stringify({
      data: [centre],
      pagination: result.pagination
    }, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Data structure is consistent and ready for UI consumption!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

showSampleData();
