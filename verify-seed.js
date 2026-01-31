const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  const tuitionCentres = await prisma.tuitionCentre.findMany({
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

  console.log(`Found ${tuitionCentres.length} tuition centres`);
  console.log('\nFirst centre:');
  console.log(JSON.stringify(tuitionCentres[0], null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
