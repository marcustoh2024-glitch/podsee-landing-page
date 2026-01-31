const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  console.log('Starting seed...');

  // Create Levels
  const levels = await Promise.all([
    prisma.level.upsert({
      where: { name: 'Primary' },
      update: {},
      create: { name: 'Primary' },
    }),
    prisma.level.upsert({
      where: { name: 'Secondary' },
      update: {},
      create: { name: 'Secondary' },
    }),
    prisma.level.upsert({
      where: { name: 'Junior College' },
      update: {},
      create: { name: 'Junior College' },
    }),
    prisma.level.upsert({
      where: { name: 'IB' },
      update: {},
      create: { name: 'IB' },
    }),
    prisma.level.upsert({
      where: { name: 'IGCSE' },
      update: {},
      create: { name: 'IGCSE' },
    }),
  ]);

  console.log('Created levels:', levels.map(l => l.name).join(', '));

  // Create Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: { name: 'Mathematics' },
    }),
    prisma.subject.upsert({
      where: { name: 'Science' },
      update: {},
      create: { name: 'Science' },
    }),
    prisma.subject.upsert({
      where: { name: 'English' },
      update: {},
      create: { name: 'English' },
    }),
    prisma.subject.upsert({
      where: { name: 'Chinese' },
      update: {},
      create: { name: 'Chinese' },
    }),
    prisma.subject.upsert({
      where: { name: 'Physics' },
      update: {},
      create: { name: 'Physics' },
    }),
    prisma.subject.upsert({
      where: { name: 'Chemistry' },
      update: {},
      create: { name: 'Chemistry' },
    }),
    prisma.subject.upsert({
      where: { name: 'Biology' },
      update: {},
      create: { name: 'Biology' },
    }),
    prisma.subject.upsert({
      where: { name: 'History' },
      update: {},
      create: { name: 'History' },
    }),
    prisma.subject.upsert({
      where: { name: 'Geography' },
      update: {},
      create: { name: 'Geography' },
    }),
  ]);

  console.log('Created subjects:', subjects.map(s => s.name).join(', '));

  // Helper to find level and subject by name
  const findLevel = (name) => levels.find(l => l.name === name);
  const findSubject = (name) => subjects.find(s => s.name === name);

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
      name: 'Future Scholars Academy',
      location: 'Woodlands',
      whatsappNumber: '+6596543210',
      website: 'https://futurescholars.edu.sg',
      levels: ['Secondary', 'Junior College', 'IB'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    },
    {
      name: 'Knowledge Hub',
      location: 'Clementi',
      whatsappNumber: '+6595432109',
      website: 'https://knowledgehub.com.sg',
      levels: ['Primary', 'Secondary'],
      subjects: ['Mathematics', 'Science', 'English', 'Chinese'],
    },
    {
      name: 'Prime Education Centre',
      location: 'Ang Mo Kio',
      whatsappNumber: '+6594321098',
      website: null,
      levels: ['Junior College', 'IB', 'IGCSE'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'],
    },
    {
      name: 'Smart Learning Studio',
      location: 'Bedok',
      whatsappNumber: '+6593210987',
      website: 'https://smartlearning.sg',
      levels: ['Primary', 'Secondary'],
      subjects: ['English', 'Mathematics', 'Science'],
    },
    {
      name: 'Top Achievers Tuition',
      location: 'Hougang',
      whatsappNumber: '+6592109876',
      website: 'https://topachievers.com',
      levels: ['Secondary', 'Junior College'],
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
    },
    {
      name: 'Victory Learning Centre',
      location: 'Yishun',
      whatsappNumber: '+6591098765',
      website: null,
      levels: ['Primary'],
      subjects: ['Mathematics', 'English', 'Chinese', 'Science'],
    },
    {
      name: 'Wisdom Education Hub',
      location: 'Punggol',
      whatsappNumber: '+6590987654',
      website: 'https://wisdomedu.sg',
      levels: ['Primary', 'Secondary', 'IGCSE'],
      subjects: ['Mathematics', 'Science', 'English', 'Geography'],
    },
  ];

  for (const centre of tuitionCentres) {
    const created = await prisma.tuitionCentre.create({
      data: {
        name: centre.name,
        location: centre.location,
        whatsappNumber: centre.whatsappNumber,
        website: centre.website,
        levels: {
          create: centre.levels.map(levelName => ({
            level: {
              connect: { id: findLevel(levelName).id }
            }
          }))
        },
        subjects: {
          create: centre.subjects.map(subjectName => ({
            subject: {
              connect: { id: findSubject(subjectName).id }
            }
          }))
        }
      },
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
        }
      }
    });

    console.log(`Created tuition centre: ${created.name}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
