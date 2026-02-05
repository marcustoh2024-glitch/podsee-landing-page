const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  console.log('📥 Importing data to PostgreSQL...\n');

  try {
    // Read exported data
    const exportPath = path.join(__dirname, '..', 'data-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.error('❌ No export file found. Run export-sqlite-data.js first!');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`📦 Found export from ${data.timestamp}\n`);

    // Import in correct order to respect foreign keys
    console.log('1️⃣  Importing levels...');
    for (const level of data.levels) {
      await prisma.level.upsert({
        where: { id: level.id },
        update: {},
        create: {
          id: level.id,
          name: level.name,
          createdAt: new Date(level.createdAt)
        }
      });
    }
    console.log(`   ✅ ${data.levels.length} levels imported`);

    console.log('2️⃣  Importing subjects...');
    for (const subject of data.subjects) {
      await prisma.subject.upsert({
        where: { id: subject.id },
        update: {},
        create: {
          id: subject.id,
          name: subject.name,
          createdAt: new Date(subject.createdAt)
        }
      });
    }
    console.log(`   ✅ ${data.subjects.length} subjects imported`);

    console.log('3️⃣  Importing users...');
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          username: user.username,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    console.log(`   ✅ ${data.users.length} users imported`);

    console.log('4️⃣  Importing tuition centres...');
    let centreCount = 0;
    let offeringCount = 0;
    let threadCount = 0;
    let commentCount = 0;

    for (const centre of data.tuitionCentres) {
      // Create centre
      await prisma.tuitionCentre.upsert({
        where: { id: centre.id },
        update: {},
        create: {
          id: centre.id,
          name: centre.name,
          location: centre.location,
          whatsappNumber: centre.whatsappNumber,
          website: centre.website,
          dataQualityStatus: centre.dataQualityStatus,
          dataQualityNotes: centre.dataQualityNotes,
          createdAt: new Date(centre.createdAt),
          updatedAt: new Date(centre.updatedAt)
        }
      });
      centreCount++;

      // Create level relationships
      for (const levelRel of centre.levels) {
        await prisma.tuitionCentreLevel.upsert({
          where: {
            tuitionCentreId_levelId: {
              tuitionCentreId: levelRel.tuitionCentreId,
              levelId: levelRel.levelId
            }
          },
          update: {},
          create: {
            tuitionCentreId: levelRel.tuitionCentreId,
            levelId: levelRel.levelId
          }
        });
      }

      // Create subject relationships
      for (const subjectRel of centre.subjects) {
        await prisma.tuitionCentreSubject.upsert({
          where: {
            tuitionCentreId_subjectId: {
              tuitionCentreId: subjectRel.tuitionCentreId,
              subjectId: subjectRel.subjectId
            }
          },
          update: {},
          create: {
            tuitionCentreId: subjectRel.tuitionCentreId,
            subjectId: subjectRel.subjectId
          }
        });
      }

      // Create offerings
      for (const offering of centre.offerings) {
        await prisma.offering.upsert({
          where: { id: offering.id },
          update: {},
          create: {
            id: offering.id,
            tuitionCentreId: offering.tuitionCentreId,
            levelId: offering.levelId,
            subjectId: offering.subjectId,
            createdAt: new Date(offering.createdAt)
          }
        });
        offeringCount++;
      }

      // Create discussion thread and comments
      if (centre.discussionThread) {
        const thread = centre.discussionThread;
        await prisma.discussionThread.upsert({
          where: { id: thread.id },
          update: {},
          create: {
            id: thread.id,
            tuitionCentreId: thread.tuitionCentreId,
            createdAt: new Date(thread.createdAt)
          }
        });
        threadCount++;

        // Create comments
        for (const comment of thread.comments) {
          await prisma.comment.upsert({
            where: { id: comment.id },
            update: {},
            create: {
              id: comment.id,
              discussionThreadId: comment.discussionThreadId,
              authorId: comment.authorId,
              body: comment.body,
              isAnonymous: comment.isAnonymous,
              isHidden: comment.isHidden,
              createdAt: new Date(comment.createdAt),
              updatedAt: new Date(comment.updatedAt)
            }
          });
          commentCount++;
        }
      }
    }

    console.log(`   ✅ ${centreCount} tuition centres imported`);
    console.log(`   ✅ ${offeringCount} offerings imported`);
    console.log(`   ✅ ${threadCount} discussion threads imported`);
    console.log(`   ✅ ${commentCount} comments imported`);

    console.log('\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
