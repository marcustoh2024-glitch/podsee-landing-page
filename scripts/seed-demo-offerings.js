const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDemoOfferings() {
  console.log('🌱 Seeding demo offerings...\n');
  
  try {
    // Get first 10 centres
    const centres = await prisma.tuitionCentre.findMany({
      take: 10,
      orderBy: { name: 'asc' }
    });
    
    console.log(`Found ${centres.length} centres for demo data\n`);
    
    // Create explicit levels
    const levels = [
      'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
      'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4',
      'JC 1', 'JC 2'
    ];
    
    const subjects = [
      'Mathematics', 'English', 'Science', 'Chinese',
      'Physics', 'Chemistry', 'Biology',
      'History', 'Geography', 'Literature'
    ];
    
    // Create levels
    for (const levelName of levels) {
      await prisma.level.upsert({
        where: { name: levelName },
        update: {},
        create: { name: levelName }
      });
    }
    
    // Create subjects
    for (const subjectName of subjects) {
      await prisma.subject.upsert({
        where: { name: subjectName },
        update: {},
        create: { name: subjectName }
      });
    }
    
    console.log('✅ Created levels and subjects\n');
    
    // Demo offerings patterns
    const patterns = [
      { levels: ['Primary 1', 'Primary 2', 'Primary 3'], subjects: ['Mathematics', 'English', 'Science'] },
      { levels: ['Primary 4', 'Primary 5', 'Primary 6'], subjects: ['Mathematics', 'English', 'Chinese'] },
      { levels: ['Secondary 1', 'Secondary 2'], subjects: ['Mathematics', 'English', 'Science'] },
      { levels: ['Secondary 3', 'Secondary 4'], subjects: ['Mathematics', 'Physics', 'Chemistry'] },
      { levels: ['Secondary 1', 'Secondary 2', 'Secondary 3'], subjects: ['English', 'Literature', 'History'] },
      { levels: ['JC 1', 'JC 2'], subjects: ['Mathematics', 'Physics', 'Chemistry'] },
      { levels: ['Primary 1', 'Primary 2'], subjects: ['Mathematics', 'English'] },
      { levels: ['Secondary 1'], subjects: ['Mathematics', 'English', 'Science', 'Chinese'] },
      { levels: ['Primary 5', 'Primary 6'], subjects: ['Mathematics', 'Science'] },
      { levels: ['Secondary 2', 'Secondary 3'], subjects: ['Biology', 'Chemistry', 'Physics'] }
    ];
    
    let totalOfferings = 0;
    
    for (let i = 0; i < centres.length && i < patterns.length; i++) {
      const centre = centres[i];
      const pattern = patterns[i];
      
      const offerings = [];
      
      for (const levelName of pattern.levels) {
        for (const subjectName of pattern.subjects) {
          const level = await prisma.level.findUnique({ where: { name: levelName } });
          const subject = await prisma.subject.findUnique({ where: { name: subjectName } });
          
          offerings.push({
            tuitionCentreId: centre.id,
            levelId: level.id,
            subjectId: subject.id
          });
        }
      }
      
      const created = await prisma.offering.createMany({
        data: offerings,
        skipDuplicates: true
      });
      
      console.log(`✅ ${centre.name}: ${created.count} offerings`);
      totalOfferings += created.count;
    }
    
    console.log(`\n📊 Total offerings created: ${totalOfferings}`);
    
    // Verify
    const distinctLevels = await prisma.level.count({
      where: { offerings: { some: {} } }
    });
    const distinctSubjects = await prisma.subject.count({
      where: { offerings: { some: {} } }
    });
    
    console.log(`📊 Distinct levels with offerings: ${distinctLevels}`);
    console.log(`📊 Distinct subjects with offerings: ${distinctSubjects}`);
    
    console.log('\n✅ Demo offerings seeded!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoOfferings();
