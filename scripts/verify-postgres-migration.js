const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  console.log('🔍 Verifying PostgreSQL Migration\n');
  console.log('='.repeat(50));
  
  try {
    // Check database connection
    console.log('\n1️⃣  Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Connected to database');

    // Get database provider
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.includes('postgres');
    const isSQLite = dbUrl.includes('sqlite') || dbUrl.includes('.db');
    
    console.log(`   📊 Database type: ${isPostgres ? 'PostgreSQL ✅' : isSQLite ? 'SQLite ⚠️' : 'Unknown'}`);
    
    if (!isPostgres) {
      console.log('   ⚠️  Warning: Not using PostgreSQL!');
      console.log('   Check your DATABASE_URL in .env or .env.local');
    }

    // Count records
    console.log('\n2️⃣  Checking data...');
    
    const [
      centreCount,
      levelCount,
      subjectCount,
      offeringCount,
      userCount,
      threadCount,
      commentCount
    ] = await Promise.all([
      prisma.tuitionCentre.count(),
      prisma.level.count(),
      prisma.subject.count(),
      prisma.offering.count(),
      prisma.user.count(),
      prisma.discussionThread.count(),
      prisma.comment.count()
    ]);

    console.log(`   📚 Tuition Centres: ${centreCount}`);
    console.log(`   📊 Levels: ${levelCount}`);
    console.log(`   📖 Subjects: ${subjectCount}`);
    console.log(`   🎯 Offerings: ${offeringCount}`);
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   💬 Discussion Threads: ${threadCount}`);
    console.log(`   💭 Comments: ${commentCount}`);

    // Test a sample query
    console.log('\n3️⃣  Testing sample query...');
    const sampleCentre = await prisma.tuitionCentre.findFirst({
      include: {
        levels: {
          include: {
            level: true
          }
        },
        subjects: {
          include: {
            subject: true
          }
        },
        offerings: {
          include: {
            level: true,
            subject: true
          }
        }
      }
    });

    if (sampleCentre) {
      console.log(`   ✅ Sample centre: ${sampleCentre.name}`);
      console.log(`   📍 Location: ${sampleCentre.location}`);
      console.log(`   📊 Levels: ${sampleCentre.levels.length}`);
      console.log(`   📖 Subjects: ${sampleCentre.subjects.length}`);
      console.log(`   🎯 Offerings: ${sampleCentre.offerings.length}`);
    } else {
      console.log('   ⚠️  No centres found in database');
    }

    // Test relationships
    console.log('\n4️⃣  Testing relationships...');
    const centreWithOfferings = await prisma.tuitionCentre.findFirst({
      where: {
        offerings: {
          some: {}
        }
      },
      include: {
        offerings: {
          include: {
            level: true,
            subject: true
          }
        }
      }
    });

    if (centreWithOfferings && centreWithOfferings.offerings.length > 0) {
      console.log('   ✅ Offerings relationship working');
      const offering = centreWithOfferings.offerings[0];
      console.log(`   Example: ${offering.level.name} - ${offering.subject.name}`);
    } else {
      console.log('   ⚠️  No offerings found');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Migration Summary:');
    
    const totalRecords = centreCount + levelCount + subjectCount + offeringCount + userCount + threadCount + commentCount;
    
    if (isPostgres && totalRecords > 0) {
      console.log('✅ Migration successful!');
      console.log('✅ Using PostgreSQL');
      console.log(`✅ ${totalRecords} total records migrated`);
      console.log('\nNext steps:');
      console.log('1. Test locally: npm run dev');
      console.log('2. Deploy to Vercel: git push');
    } else if (!isPostgres) {
      console.log('⚠️  Still using SQLite');
      console.log('Run: npm run migrate:postgres');
    } else {
      console.log('⚠️  Database is empty');
      console.log('Run: npm run db:import');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check DATABASE_URL in .env or .env.local');
    console.log('2. Ensure database tables exist: npx prisma db push');
    console.log('3. Import data: npm run db:import');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
