/**
 * Query Pipeline Execution Trace
 * 
 * Simulates the exact flow from frontend filter selection to database query
 * and back to UI display, with detailed logging at each step.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

// Import the service to test actual logic
const path = require('path');

// Simulate the service layer logic
class TuitionCentreService {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  expandLevelNames(levelNames) {
    const levelMapping = {
      'Primary': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
      'Secondary': ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4'],
      'JC': ['JC 1', 'JC 2'],
      'Junior College': ['JC 1', 'JC 2']
    };

    const expandedLevels = [];
    
    for (const level of levelNames) {
      const trimmedLevel = level.trim();
      
      if (levelMapping[trimmedLevel]) {
        expandedLevels.push(...levelMapping[trimmedLevel]);
      } else {
        expandedLevels.push(trimmedLevel);
      }
    }
    
    return [...new Set(expandedLevels)];
  }

  async searchTuitionCentres(filters = {}) {
    const { search, levels, subjects, page = 1, limit = 20 } = filters;

    const whereConditions = [];

    if (search && search.trim()) {
      whereConditions.push({
        OR: [
          { name: { contains: search.trim() } },
          { location: { contains: search.trim() } }
        ]
      });
    }

    if (levels && levels.length > 0) {
      const expandedLevels = this.expandLevelNames(levels);
      
      whereConditions.push({
        levels: {
          some: {
            level: {
              OR: expandedLevels.flatMap(level => [
                { id: level },
                { name: { equals: level } }
              ])
            }
          }
        }
      });
    }

    if (subjects && subjects.length > 0) {
      whereConditions.push({
        subjects: {
          some: {
            subject: {
              OR: subjects.flatMap(subject => [
                { id: subject },
                { name: { equals: subject } }
              ])
            }
          }
        }
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.tuitionCentre.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy: {
          name: 'asc'
        }
      }),
      this.prisma.tuitionCentre.count({ where })
    ]);

    const formattedData = data.map(centre => ({
      id: centre.id,
      name: centre.name,
      location: centre.location,
      whatsappNumber: centre.whatsappNumber,
      whatsappLink: this.formatWhatsAppLink(centre.whatsappNumber),
      website: centre.website,
      levels: centre.levels.map(l => ({
        id: l.level.id,
        name: l.level.name
      })),
      subjects: centre.subjects.map(s => ({
        id: s.subject.id,
        name: s.subject.name
      })),
      createdAt: centre.createdAt,
      updatedAt: centre.updatedAt
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  formatWhatsAppLink(phoneNumber) {
    if (!phoneNumber) {
      return '';
    }
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    const digits = cleaned.replace(/^\+/, '');
    return `https://wa.me/${digits}`;
  }
}

async function traceQueryExecution() {
  console.log('='.repeat(80));
  console.log('QUERY PIPELINE EXECUTION TRACE');
  console.log('='.repeat(80));
  console.log('\n');

  // ============================================================================
  // STEP 1: Frontend Filter Selection
  // ============================================================================
  console.log('📱 STEP 1: Frontend Filter Selection');
  console.log('-'.repeat(80));
  
  const frontendFilters = {
    level: 'Secondary',
    subject: 'Mathematics'
  };
  
  console.log('User selects:');
  console.log(`  Level: ${frontendFilters.level}`);
  console.log(`  Subject: ${frontendFilters.subject}`);
  console.log('\n');

  // ============================================================================
  // STEP 2: URL Construction
  // ============================================================================
  console.log('🔗 STEP 2: URL Construction');
  console.log('-'.repeat(80));
  
  const urlParams = new URLSearchParams({
    level: frontendFilters.level,
    subject: frontendFilters.subject
  });
  
  const navigationUrl = `/results?${urlParams.toString()}`;
  console.log(`Navigation URL: ${navigationUrl}`);
  console.log('\n');

  // ============================================================================
  // STEP 3: API Request Construction
  // ============================================================================
  console.log('🌐 STEP 3: API Request Construction');
  console.log('-'.repeat(80));
  
  const apiParams = new URLSearchParams();
  apiParams.append('levels', frontendFilters.level);    // Note: plural
  apiParams.append('subjects', frontendFilters.subject); // Note: plural
  
  const apiUrl = `/api/tuition-centres?${apiParams.toString()}`;
  console.log(`API Request URL: ${apiUrl}`);
  console.log('\n');

  // ============================================================================
  // STEP 4: API Route Parameter Parsing
  // ============================================================================
  console.log('⚙️  STEP 4: API Route Parameter Parsing');
  console.log('-'.repeat(80));
  
  const levelsParam = 'Secondary';
  const subjectsParam = 'Mathematics';
  
  const levels = levelsParam.split(',').map(l => l.trim()).filter(Boolean);
  const subjects = subjectsParam.split(',').map(s => s.trim()).filter(Boolean);
  
  const parsedFilters = {
    levels,
    subjects,
    page: 1,
    limit: 20
  };
  
  console.log('Parsed filters:');
  console.log(JSON.stringify(parsedFilters, null, 2));
  console.log('\n');

  // ============================================================================
  // STEP 5: Service Layer - Level Expansion
  // ============================================================================
  console.log('🔄 STEP 5: Service Layer - Level Expansion');
  console.log('-'.repeat(80));
  
  const service = new TuitionCentreService(prisma);
  const expandedLevels = service.expandLevelNames(levels);
  
  console.log(`Input levels: ${JSON.stringify(levels)}`);
  console.log(`Expanded levels: ${JSON.stringify(expandedLevels)}`);
  console.log('\n⚠️  TRANSFORMATION: "Secondary" → 4 specific levels');
  console.log('\n');

  // ============================================================================
  // STEP 6: Execute Query
  // ============================================================================
  console.log('💾 STEP 6: Execute Database Query');
  console.log('-'.repeat(80));
  console.log('Executing query with filters:');
  console.log(JSON.stringify(parsedFilters, null, 2));
  console.log('\n');

  const result = await service.searchTuitionCentres(parsedFilters);

  console.log(`✅ Query returned ${result.data.length} centres (total: ${result.pagination.total})`);
  console.log('\n');

  // ============================================================================
  // STEP 7: Analyze Results
  // ============================================================================
  console.log('📊 STEP 7: Analyze Results');
  console.log('-'.repeat(80));
  
  if (result.data.length > 0) {
    const firstCentre = result.data[0];
    
    console.log(`First result: ${firstCentre.name}`);
    console.log(`Location: ${firstCentre.location}`);
    console.log(`\nAll levels for this centre (${firstCentre.levels.length} total):`);
    firstCentre.levels.forEach(l => console.log(`  - ${l.name}`));
    
    console.log(`\nAll subjects for this centre (${firstCentre.subjects.length} total):`);
    firstCentre.subjects.forEach(s => console.log(`  - ${s.name}`));
    
    console.log('\n⚠️  NOTE: ALL levels and subjects returned, not just matching ones');
    console.log('\n');

    // ============================================================================
    // STEP 8: Frontend Display Simulation
    // ============================================================================
    console.log('🎨 STEP 8: Frontend Display Simulation');
    console.log('-'.repeat(80));
    
    const displayLevel = firstCentre.levels?.[0]?.name || frontendFilters.level;
    const displaySubject = firstCentre.subjects?.[0]?.name || frontendFilters.subject;
    
    console.log('Card display:');
    console.log(`  Name: ${firstCentre.name}`);
    console.log(`  Location: ${firstCentre.location}`);
    console.log(`  Level shown: ${displayLevel}`);
    console.log(`  Subject shown: ${displaySubject}`);
    console.log('\n⚠️  TRANSFORMATION: Only FIRST level and subject displayed');
    console.log(`   User selected: "${frontendFilters.level}"`);
    console.log(`   Card shows: "${displayLevel}"`);
    console.log('\n');

    // ============================================================================
    // STEP 9: Verify Matching Logic
    // ============================================================================
    console.log('✅ STEP 9: Verify Matching Logic');
    console.log('-'.repeat(80));
    
    const hasMatchingLevel = firstCentre.levels.some(l => 
      expandedLevels.includes(l.name)
    );
    const hasMatchingSubject = firstCentre.subjects.some(s => 
      subjects.includes(s.name)
    );
    
    console.log(`Centre has matching level? ${hasMatchingLevel}`);
    console.log(`  Expanded levels: ${expandedLevels.join(', ')}`);
    console.log(`  Centre levels: ${firstCentre.levels.map(l => l.name).join(', ')}`);
    console.log(`  Matching: ${firstCentre.levels.filter(l => expandedLevels.includes(l.name)).map(l => l.name).join(', ')}`);
    
    console.log(`\nCentre has matching subject? ${hasMatchingSubject}`);
    console.log(`  Query subjects: ${subjects.join(', ')}`);
    console.log(`  Centre subjects: ${firstCentre.subjects.map(s => s.name).join(', ')}`);
    console.log(`  Matching: ${firstCentre.subjects.filter(s => subjects.includes(s.name)).map(s => s.name).join(', ')}`);
    console.log('\n');
  }

  // ============================================================================
  // STEP 10: Summary
  // ============================================================================
  console.log('='.repeat(80));
  console.log('📋 SUMMARY');
  console.log('='.repeat(80));
  console.log(`\nUser selected: "${frontendFilters.level}" + "${frontendFilters.subject}"`);
  console.log(`Query expanded to: ${expandedLevels.join(', ')} + ${subjects.join(', ')}`);
  console.log(`Results found: ${result.pagination.total} centres`);
  console.log(`\nLogic: Centre must have (ANY expanded level) AND (ANY query subject)`);
  console.log(`Display: Shows FIRST level and FIRST subject on card`);
  console.log('\n');

  await prisma.$disconnect();
}

traceQueryExecution().catch(console.error);
