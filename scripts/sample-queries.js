/**
 * Sample Queries - Real-world parent search scenarios
 * 
 * This demonstrates how the normalized data works with typical parent searches
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSampleQueries() {
  console.log('='.repeat(80));
  console.log('SAMPLE PARENT QUERIES');
  console.log('='.repeat(80));
  console.log('\n');
  
  const queries = [
    {
      title: 'Parent looking for Primary 6 Math tuition in Marine Parade',
      filters: {
        location: 'Marine Parade',
        subject: 'Mathematics',
        level: 'Primary 6'
      }
    },
    {
      title: 'Parent looking for Secondary 4 Physics tuition',
      filters: {
        location: 'Marine Parade',
        subject: 'Physics',
        level: 'Secondary 4'
      }
    },
    {
      title: 'Parent looking for JC Economics tuition',
      filters: {
        location: 'Marine Parade',
        subject: 'Economics',
        level: 'JC 2'
      }
    },
    {
      title: 'Parent looking for Chinese tuition (any level)',
      filters: {
        location: 'Marine Parade',
        subject: 'Chinese'
      }
    },
    {
      title: 'Parent looking for Additional Math for Sec 3',
      filters: {
        location: 'Marine Parade',
        subject: 'Additional Mathematics',
        level: 'Secondary 3'
      }
    }
  ];
  
  for (const query of queries) {
    console.log(`📝 ${query.title}`);
    console.log('-'.repeat(80));
    
    const where = {
      location: query.filters.location,
      subjects: {
        some: {
          subject: {
            name: query.filters.subject
          }
        }
      }
    };
    
    if (query.filters.level) {
      where.levels = {
        some: {
          level: {
            name: query.filters.level
          }
        }
      };
    }
    
    const results = await prisma.tuitionCentre.findMany({
      where,
      include: {
        subjects: {
          include: {
            subject: true
          }
        },
        levels: {
          include: {
            level: true
          }
        }
      },
      take: 5
    });
    
    console.log(`\n✅ Found ${results.length} centres\n`);
    
    if (results.length > 0) {
      results.forEach((centre, i) => {
        const subjects = centre.subjects.map(s => s.subject.name).sort();
        const levels = centre.levels.map(l => l.level.name).sort();
        
        console.log(`${i + 1}. ${centre.name}`);
        console.log(`   Website: ${centre.website || 'N/A'}`);
        console.log(`   All subjects: ${subjects.slice(0, 5).join(', ')}${subjects.length > 5 ? '...' : ''}`);
        console.log(`   All levels: ${levels.slice(0, 5).join(', ')}${levels.length > 5 ? '...' : ''}`);
        console.log('');
      });
    } else {
      console.log('   No centres found for this combination.\n');
    }
    
    console.log('\n');
  }
  
  console.log('='.repeat(80));
  console.log('✅ ALL SAMPLE QUERIES COMPLETE');
  console.log('='.repeat(80));
  console.log('\n');
  
  await prisma.$disconnect();
}

runSampleQueries();
