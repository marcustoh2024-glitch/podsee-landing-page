const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('🔍 Checking for duplicate tuition centres...\n');

    // Get all centres
    const centres = await prisma.tuitionCentre.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Total centres in database: ${centres.length}\n`);

    // Group by name
    const nameGroups = {};
    centres.forEach(centre => {
      if (!nameGroups[centre.name]) {
        nameGroups[centre.name] = [];
      }
      nameGroups[centre.name].push(centre);
    });

    // Find duplicates
    const duplicates = Object.entries(nameGroups).filter(([name, centres]) => centres.length > 1);

    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate centre names:\n`);
      duplicates.forEach(([name, centres]) => {
        console.log(`  "${name}" - ${centres.length} entries:`);
        centres.forEach(c => {
          console.log(`    - ID: ${c.id}, Location: ${c.location || 'N/A'}`);
        });
        console.log('');
      });

      const totalDuplicateEntries = duplicates.reduce((sum, [, centres]) => sum + centres.length, 0);
      const uniqueCount = centres.length - (totalDuplicateEntries - duplicates.length);
      console.log(`📊 Summary:`);
      console.log(`  Total entries: ${centres.length}`);
      console.log(`  Unique centres: ${uniqueCount}`);
      console.log(`  Duplicate entries: ${totalDuplicateEntries - duplicates.length}`);
    } else {
      console.log('✅ No duplicates found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
