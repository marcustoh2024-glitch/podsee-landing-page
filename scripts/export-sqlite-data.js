const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Exporting SQLite data...\n');

  try {
    // Export all data
    const data = {
      tuitionCentres: await prisma.tuitionCentre.findMany({
        include: {
          levels: true,
          subjects: true,
          offerings: true,
          discussionThread: {
            include: {
              comments: true
            }
          }
        }
      }),
      levels: await prisma.level.findMany(),
      subjects: await prisma.subject.findMany(),
      users: await prisma.user.findMany(),
      timestamp: new Date().toISOString()
    };

    // Save to file
    const exportPath = path.join(__dirname, '..', 'data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`📁 Location: ${exportPath}`);
    console.log(`\nExported:`);
    console.log(`  - ${data.tuitionCentres.length} tuition centres`);
    console.log(`  - ${data.levels.length} levels`);
    console.log(`  - ${data.subjects.length} subjects`);
    console.log(`  - ${data.users.length} users`);
    
    const totalComments = data.tuitionCentres.reduce((sum, centre) => {
      return sum + (centre.discussionThread?.comments?.length || 0);
    }, 0);
    console.log(`  - ${totalComments} comments`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
