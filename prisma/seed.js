const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create Levels
  const levels = [
    { name: 'Primary' },
    { name: 'Secondary' },
    { name: 'Junior College' },
    { name: 'IB' },
    { name: 'IGCSE' },
  ];

  console.log('Creating levels...');
  const createdLevels = {};
  for (const level of levels) {
    const created = await prisma.level.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
    createdLevels[level.name] = created;
    console.log(`  ✓ ${level.name}`);
  }

  // Create Subjects
  const subjects = [
    { name: 'Mathematics' },
    { name: 'Science' },
    { name: 'English' },
    { name: 'Chinese' },
    { name: 'Physics' },
    { name: 'Chemistry' },
    { name: 'Biology' },
    { name: 'History' },
    { name: 'Geography' },
    { name: 'Literature' },
  ];

  console.log('Creating subjects...');
  const createdSubjects = {};
  for (const subject of subjects) {
    const created = await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
    createdSubjects[subject.name] = created;
    console.log(`  ✓ ${subject.name}`);
  }

  // Create Tuition Centres with relationships
  const tuitionCentres = [
    {
      name: 'ABC Learning Centre',
      location: 'Tampines',
      whatsappNumber: '+6591234567',
      website: 'https://abclearning.com',
      levels: ['Primary', 'Secondary'],
      subjects: ['Mathematics', 'Science', 'English'],
    },
    {
      name: 'Bright Minds Education',
      location: 'Jurong East',
      whatsappNumber: '+6598765432',
      website: 'https://brightminds.sg',
      levels: ['Secondary', 'Junior College'],
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
    },
    {
      name: 'Excel Tuition Hub',
      location: 'Bishan',
      whatsappNumber: '+6587654321',
      website: null,
      levels: ['Primary'],
      subjects: ['English', 'Chinese', 'Mathematics'],
    },
    {
      name: 'Knowledge Point',
      location: 'Ang Mo Kio',
      whatsappNumber: '+6596543210',
      website: 'https://knowledgepoint.edu.sg',
      levels: ['Secondary', 'Junior College', 'IB'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    },
    {
      name: 'Smart Learners Academy',
      location: 'Clementi',
      whatsappNumber: '+6593456789',
      website: 'https://smartlearners.com.sg',
      levels: ['Primary', 'Secondary'],
      subjects: ['Mathematics', 'Science', 'English', 'Chinese'],
    },
    {
      name: 'Elite Education Centre',
      location: 'Orchard',
      whatsappNumber: '+6592345678',
      website: 'https://eliteedu.sg',
      levels: ['Junior College', 'IB', 'IGCSE'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Literature'],
    },
    {
      name: 'Future Stars Tuition',
      location: 'Woodlands',
      whatsappNumber: '+6591111111',
      website: null,
      levels: ['Primary', 'Secondary'],
      subjects: ['English', 'Mathematics', 'Science'],
    },
    {
      name: 'Ace Tuition Centre',
      location: 'Bedok',
      whatsappNumber: '+6592222222',
      website: 'https://acetuition.com',
      levels: ['Secondary', 'Junior College'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    },
    {
      name: 'Genius Learning Hub',
      location: 'Hougang',
      whatsappNumber: '+6593333333',
      website: 'https://geniuslearning.sg',
      levels: ['Primary'],
      subjects: ['Mathematics', 'English', 'Chinese', 'Science'],
    },
    {
      name: 'Prime Tutors',
      location: 'Serangoon',
      whatsappNumber: '+6594444444',
      website: 'https://primetutors.com.sg',
      levels: ['Secondary', 'Junior College', 'IGCSE'],
      subjects: ['Mathematics', 'English', 'History', 'Geography'],
    },
    {
      name: 'Stellar Education',
      location: 'Punggol',
      whatsappNumber: '+6595555555',
      website: null,
      levels: ['Primary', 'Secondary'],
      subjects: ['Mathematics', 'Science', 'English'],
    },
    {
      name: 'Top Grade Academy',
      location: 'Yishun',
      whatsappNumber: '+6596666666',
      website: 'https://topgrade.edu.sg',
      levels: ['Junior College', 'IB'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Literature'],
    },
  ];

  console.log('Creating tuition centres...');
  for (const centre of tuitionCentres) {
    const { levels: levelNames, subjects: subjectNames, ...centreData } = centre;

    const created = await prisma.tuitionCentre.create({
      data: {
        ...centreData,
        levels: {
          create: levelNames.map((levelName) => ({
            level: {
              connect: { id: createdLevels[levelName].id },
            },
          })),
        },
        subjects: {
          create: subjectNames.map((subjectName) => ({
            subject: {
              connect: { id: createdSubjects[subjectName].id },
            },
          })),
        },
      },
      include: {
        levels: {
          include: {
            level: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    console.log(`  ✓ ${created.name} (${created.location})`);
  }

  console.log('\nSeed completed successfully!');
  console.log(`Created ${levels.length} levels`);
  console.log(`Created ${subjects.length} subjects`);
  console.log(`Created ${tuitionCentres.length} tuition centres`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
