const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tuitionData = [
  {
    centreName: 'HK Learning Centre Branch',
    branchName: '504 Jurong West St 51 #03-215, Singapore 640504',
    postalCode: '60659166',
    landline: '86427188',
    whatsapp: 'https://www.facebook.com/hklearningcentre',
    website: 'Primary school subjects',
    subjects: 'Primary 1, Primary 2, Primary 3, Primary 4, Primary 5, Primary 6',
    levels: 'Primary 1, Primary 2, Primary 3, Primary 4, Primary 5, Primary 6'
  },
  {
    centreName: 'HK Learning Centre',
    branchName: 'Blk 504 Jurong West St 51 #03-217, Singapore 640504',
    postalCode: '60659166',
    landline: '86427188',
    whatsapp: 'https://www.facebook.com/hklearningcentre',
    website: 'Primary school subjects',
    subjects: 'Primary 1, Primary 2, Primary 3, Primary 4, Primary 5, Primary 6',
    levels: 'Primary 1, Primary 2, Primary 3, Primary 4, Primary 5, Primary 6'
  },
  {
    centreName: '3House Learning Centre Kindergarten',
    branchName: 'Blk 891 Tampines Ave 8 #01-82, Singapore 520891',
    postalCode: '61000048',
    landline: '88099507',
    whatsapp: 'https://www.3houselearningcentre.com',
    website: 'English, Mathematics, Science',
    subjects: 'Pre-School, Nursery, Kindergarten',
    levels: 'Pre-School, Nursery, Kindergarten'
  },
  {
    centreName: 'Ingenius Student Care Branch',
    branchName: '32 Sam Leung Road, Singapore 207922',
    postalCode: '64690491',
    landline: '67574121',
    whatsapp: 'https://ingenius.nanyang.edu.sg',
    website: 'Coding Enrichment, Science',
    subjects: 'Primary School',
    levels: 'Primary School'
  },
  {
    centreName: 'Ingenius Student Care Branch',
    branchName: '84 Chun Tin Road, Singapore 599585',
    postalCode: '64690491',
    landline: '67574121',
    whatsapp: 'https://ingenius.nanyang.edu.sg',
    website: 'Coding Enrichment, Science',
    subjects: 'Primary School',
    levels: 'Primary School'
  },
  {
    centreName: '3House Learning Centre Tampines East',
    branchName: 'Blk 201E Tampines st. 23 #02-102, Singapore 527021',
    postalCode: '61000048',
    landline: '88099507',
    whatsapp: 'https://www.3houselearningcentre.com',
    website: 'English, Mathematics, Science',
    subjects: 'Pre-School, Nursery, Kindergarten',
    levels: 'Pre-School, Nursery, Kindergarten'
  },
  {
    centreName: '3House Learning Centre Tampines',
    branchName: '143 Tampines St. 12 #01-67, Singapore 521143',
    postalCode: '61000048',
    landline: '88099507',
    whatsapp: 'https://www.3houselearningcentre.com',
    website: 'Academic subjects (local curriculum)',
    subjects: 'Kindergarten (P1-8 years old)',
    levels: 'Kindergarten (P1-8 years old)'
  },
  {
    centreName: '3House Learning Centre Tampines West',
    branchName: 'Blk 866A Tampines St. 83 #03-01, Singapore 521866; Tampines East: Blk 201E Tampines st. 23 #02-102, Singapore 527021',
    postalCode: '61000048',
    landline: '8809 9507',
    whatsapp: 'https://www.3houselearningcentre.com',
    website: 'Academic subjects (local curriculum)',
    subjects: 'Kindergarten (P1-8 years old)',
    levels: 'Kindergarten (P1-8 years old)'
  },
  {
    centreName: '3House Learning Centre Tampines West',
    branchName: 'Blk 866A Tampines St. 83 #03-01; Tampines Central: C.G. Singapore 521866',
    postalCode: '61000048',
    landline: '88099507',
    whatsapp: 'https://www.3houselearningcentre.com',
    website: 'English, Mathematics, Science',
    subjects: 'Pre-School, Nursery, Kindergarten',
    levels: 'Pre-School, Nursery, Kindergarten'
  },
  {
    centreName: 'Wang Learning Centre Yung Kuang Rd',
    branchName: '1 Yung Kuang Rd, #01-16/17/18, Singapore 627705',
    postalCode: '495 63303503',
    landline: '495 98032399',
    whatsapp: 'https://wlc.sg/',
    website: 'English',
    subjects: 'Preschool, Primary School',
    levels: 'Preschool, Primary School'
  },
  {
    centreName: 'LIE SG Abacus Plus Main Centre',
    branchName: '124 Jurong Gateway Road, #04-307A, Singapore 600134',
    postalCode: '64429 0982',
    landline: '9643 9754',
    whatsapp: 'https://sgabacus.com/',
    website: 'Abacus Mental Arithmetic',
    subjects: 'Children (Elementary, Intermediate, Advanced)',
    levels: 'Children (Elementary, Intermediate, Advanced)'
  },
  {
    centreName: 'LIE SG Abacus Plus Jurong Gateway Main Office',
    branchName: '124 Jurong Gateway Road, #04-307A, Singapore 600134',
    postalCode: '600134 West',
    landline: '64429982',
    whatsapp: 'https://sgabacus.com/',
    website: 'Abacus Mental Arithmetic',
    subjects: 'Primary',
    levels: 'Primary'
  },
  {
    centreName: 'Alchemy Education Ang Mo Kio',
    branchName: '204 Bedok North Street 1, #02-417, Singapore 460204',
    postalCode: 'North-East',
    landline: '87485661',
    whatsapp: 'https://alchemyedu.com.sg',
    website: 'Biology, Chemistry',
    subjects: 'Secondary, Junior College',
    levels: 'Secondary, Junior College'
  },
  {
    centreName: 'Alpha Grades Tuition Bedok Central',
    branchName: '204 Bedok North Street 1, #02-417, Singapore 460204',
    postalCode: '460204 East',
    landline: '91521713',
    whatsapp: 'https://alphagrades.tuition.sg',
    website: 'English, Mathematics, Science',
    subjects: 'Primary, Secondary',
    levels: 'Primary, Secondary'
  },
  {
    centreName: 'Alpha Grades Tuition Woodlands',
    branchName: 'Woodlands Fung Seng Rd (West)',
    postalCode: '730606',
    landline: '91740238',
    whatsapp: 'https://alphagrades.tuition.sg',
    website: 'Math, General Paper',
    subjects: 'Math, General Paper',
    levels: 'Math, General Paper'
  }
];

async function main() {
  console.log('Starting data import...');

  // Parse and extract unique levels and subjects
  const allLevels = new Set();
  const allSubjects = new Set();

  tuitionData.forEach(centre => {
    // Parse levels
    if (centre.levels) {
      centre.levels.split(',').forEach(level => {
        const trimmed = level.trim();
        if (trimmed) allLevels.add(trimmed);
      });
    }

    // Parse subjects
    if (centre.subjects) {
      centre.subjects.split(',').forEach(subject => {
        const trimmed = subject.trim();
        if (trimmed) allSubjects.add(trimmed);
      });
    }
  });

  console.log(`Found ${allLevels.size} unique levels and ${allSubjects.size} unique subjects`);

  // Create levels
  const levelMap = {};
  for (const levelName of allLevels) {
    const level = await prisma.level.upsert({
      where: { name: levelName },
      update: {},
      create: { name: levelName }
    });
    levelMap[levelName] = level.id;
    console.log(`Created/found level: ${levelName}`);
  }

  // Create subjects
  const subjectMap = {};
  for (const subjectName of allSubjects) {
    const subject = await prisma.subject.upsert({
      where: { name: subjectName },
      update: {},
      create: { name: subjectName }
    });
    subjectMap[subjectName] = subject.id;
    console.log(`Created/found subject: ${subjectName}`);
  }

  // Create tuition centres
  let successCount = 0;
  for (const data of tuitionData) {
    try {
      const tuitionCentre = await prisma.tuitionCentre.create({
        data: {
          name: data.centreName,
          location: data.branchName,
          whatsappNumber: data.whatsapp || data.landline || '',
          website: data.website || null
        }
      });

      // Add levels
      if (data.levels) {
        const levels = data.levels.split(',').map(l => l.trim()).filter(Boolean);
        for (const levelName of levels) {
          if (levelMap[levelName]) {
            await prisma.tuitionCentreLevel.create({
              data: {
                tuitionCentreId: tuitionCentre.id,
                levelId: levelMap[levelName]
              }
            });
          }
        }
      }

      // Add subjects
      if (data.subjects) {
        const subjects = data.subjects.split(',').map(s => s.trim()).filter(Boolean);
        for (const subjectName of subjects) {
          if (subjectMap[subjectName]) {
            await prisma.tuitionCentreSubject.create({
              data: {
                tuitionCentreId: tuitionCentre.id,
                subjectId: subjectMap[subjectName]
              }
            });
          }
        }
      }

      successCount++;
      console.log(`✓ Imported: ${data.centreName}`);
    } catch (error) {
      console.error(`✗ Failed to import ${data.centreName}:`, error.message);
    }
  }

  console.log(`\nImport complete! Successfully imported ${successCount}/${tuitionData.length} centres`);
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
