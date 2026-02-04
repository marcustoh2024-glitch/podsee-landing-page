const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log('🔍 Finding and removing duplicate tuition centres...\n');

    // Get all centres grouped by name
    const centres = await prisma.tuitionCentre.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc' // Keep the oldest entry
      }
    });

    console.log(`Total centres before cleanup: ${centres.length}`);

    // Group by name
    const nameGroups = {};
    centres.forEach(centre => {
      if (!nameGroups[centre.name]) {
        nameGroups[centre.name] = [];
      }
      nameGroups[centre.name].push(centre);
    });

    // Find duplicates and collect IDs to delete
    const idsToDelete = [];
    let duplicateCount = 0;

    Object.entries(nameGroups).forEach(([name, centres]) => {
      if (centres.length > 1) {
        // Keep the first one (oldest), delete the rest
        const toDelete = centres.slice(1);
        toDelete.forEach(c => idsToDelete.push(c.id));
        duplicateCount++;
        console.log(`  "${name}" - keeping 1, removing ${toDelete.length} duplicate(s)`);
      }
    });

    if (idsToDelete.length === 0) {
      console.log('\n✅ No duplicates found!');
      return;
    }

    console.log(`\n📊 Found ${duplicateCount} centres with duplicates`);
    console.log(`🗑️  Deleting ${idsToDelete.length} duplicate entries...\n`);

    // Delete duplicates
    const result = await prisma.tuitionCentre.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });

    console.log(`✅ Deleted ${result.count} duplicate entries`);

    // Verify final count
    const finalCount = await prisma.tuitionCentre.count();
    console.log(`\n📊 Final count: ${finalCount} unique centres`);

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates();
