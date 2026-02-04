const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabaseData() {
  try {
    console.log('🔍 Checking database for tuition centre data...\n');

    // Get total count
    const totalCount = await prisma.tuitionCentre.count();
    console.log(`📊 Total tuition centres: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('❌ No data found in database!');
      return;
    }

    // Get first 5 centres
    const centres = await prisma.tuitionCentre.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log('📋 First 5 tuition centres:');
    centres.forEach((centre, index) => {
      console.log(`  ${index + 1}. [ID: ${centre.id}] ${centre.name}`);
    });

    console.log('\n✅ Database verification complete!');
  } catch (error) {
    console.error('❌ Error verifying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseData();
