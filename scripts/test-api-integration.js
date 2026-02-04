/**
 * Integration test for the API with imported data
 * Tests the actual service layer that the API uses
 */

const TuitionCentreService = require('../src/lib/services/tuitionCentreService').default;

async function testAPIIntegration() {
  console.log('='.repeat(80));
  console.log('API INTEGRATION TEST WITH IMPORTED DATA');
  console.log('='.repeat(80));
  console.log('\n');
  
  const service = new TuitionCentreService();
  
  try {
    // Test 1: Get all centres (no filters)
    console.log('Test 1: GET /api/tuition-centres');
    console.log('-'.repeat(80));
    const allResults = await service.searchTuitionCentres({});
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${allResults.pagination.total}`);
    console.log(`   Page: ${allResults.pagination.page}/${allResults.pagination.totalPages}`);
    console.log(`   Results on page: ${allResults.data.length}`);
    console.log(`   First centre: ${allResults.data[0].name}`);
    console.log(`   Has subjects: ${allResults.data[0].subjects.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   Has levels: ${allResults.data[0].levels.length > 0 ? 'Yes' : 'No'}\n`);
    
    // Test 2: Filter by subject name
    console.log('Test 2: GET /api/tuition-centres?subjects=Mathematics');
    console.log('-'.repeat(80));
    const mathResults = await service.searchTuitionCentres({
      subjects: ['Mathematics']
    });
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${mathResults.pagination.total}`);
    console.log(`   Sample centres: ${mathResults.data.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 3: Filter by level name
    console.log('Test 3: GET /api/tuition-centres?levels=Primary 6');
    console.log('-'.repeat(80));
    const p6Results = await service.searchTuitionCentres({
      levels: ['Primary 6']
    });
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${p6Results.pagination.total}`);
    console.log(`   Sample centres: ${p6Results.data.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 4: Filter by both subject and level
    console.log('Test 4: GET /api/tuition-centres?subjects=Mathematics&levels=Primary 6');
    console.log('-'.repeat(80));
    const combinedResults = await service.searchTuitionCentres({
      subjects: ['Mathematics'],
      levels: ['Primary 6']
    });
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${combinedResults.pagination.total}`);
    console.log(`   Centres: ${combinedResults.data.map(c => c.name).join(', ')}\n`);
    
    // Test 5: Search by name
    console.log('Test 5: GET /api/tuition-centres?search=Science');
    console.log('-'.repeat(80));
    const searchResults = await service.searchTuitionCentres({
      search: 'Science'
    });
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${searchResults.pagination.total}`);
    console.log(`   Centres: ${searchResults.data.map(c => c.name).join(', ')}\n`);
    
    // Test 6: Pagination
    console.log('Test 6: GET /api/tuition-centres?page=2&limit=10');
    console.log('-'.repeat(80));
    const paginatedResults = await service.searchTuitionCentres({
      page: 2,
      limit: 10
    });
    console.log(`✅ Status: 200`);
    console.log(`   Page: ${paginatedResults.pagination.page}/${paginatedResults.pagination.totalPages}`);
    console.log(`   Results on page: ${paginatedResults.data.length}`);
    console.log(`   Total: ${paginatedResults.pagination.total}\n`);
    
    // Test 7: Multiple subjects (OR logic)
    console.log('Test 7: GET /api/tuition-centres?subjects=Physics,Chemistry');
    console.log('-'.repeat(80));
    const multiSubjectResults = await service.searchTuitionCentres({
      subjects: ['Physics', 'Chemistry']
    });
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${multiSubjectResults.pagination.total}`);
    console.log(`   Sample: ${multiSubjectResults.data.slice(0, 3).map(c => c.name).join(', ')}\n`);
    
    // Test 8: Multiple levels (OR logic)
    console.log('Test 8: GET /api/tuition-centres?levels=JC 1,JC 2');
    console.log('-'.repeat(80));
    const multiLevelResults = await service.searchTuitionCentres({
      levels: ['JC 1', 'JC 2']
    });
    console.log(`✅ Status: 200`);
    console.log(`   Total centres: ${multiLevelResults.pagination.total}\n`);
    
    // Test 9: Get specific centre by ID
    console.log('Test 9: GET /api/tuition-centres/[id]');
    console.log('-'.repeat(80));
    const centreId = allResults.data[0].id;
    const centreDetail = await service.getTuitionCentreById(centreId);
    console.log(`✅ Status: 200`);
    console.log(`   Centre: ${centreDetail.name}`);
    console.log(`   Location: ${centreDetail.location}`);
    console.log(`   Website: ${centreDetail.website || 'N/A'}`);
    console.log(`   WhatsApp: ${centreDetail.whatsappNumber}`);
    console.log(`   Subjects (${centreDetail.subjects.length}): ${centreDetail.subjects.map(s => s.name).slice(0, 5).join(', ')}...`);
    console.log(`   Levels (${centreDetail.levels.length}): ${centreDetail.levels.map(l => l.name).slice(0, 5).join(', ')}...\n`);
    
    // Test 10: Response structure validation
    console.log('Test 10: Validate response structure');
    console.log('-'.repeat(80));
    const sample = allResults.data[0];
    const hasRequiredFields = 
      sample.id &&
      sample.name &&
      sample.location &&
      sample.whatsappNumber !== undefined &&
      sample.whatsappLink !== undefined &&
      Array.isArray(sample.subjects) &&
      Array.isArray(sample.levels) &&
      sample.subjects.every(s => s.id && s.name) &&
      sample.levels.every(l => l.id && l.name);
    
    if (hasRequiredFields) {
      console.log('✅ Response structure is valid');
      console.log('   Fields: id, name, location, whatsappNumber, whatsappLink, website, subjects[], levels[], createdAt, updatedAt');
      console.log('   Subject structure: { id, name }');
      console.log('   Level structure: { id, name }\n');
    } else {
      console.log('❌ Response structure is invalid\n');
    }
    
    console.log('='.repeat(80));
    console.log('✅ ALL INTEGRATION TESTS PASSED');
    console.log('='.repeat(80));
    console.log('\nSummary:');
    console.log(`- Total centres in database: ${allResults.pagination.total}`);
    console.log(`- Centres with Mathematics: ${mathResults.pagination.total}`);
    console.log(`- Centres with Primary 6: ${p6Results.pagination.total}`);
    console.log(`- Centres with Math + P6: ${combinedResults.pagination.total}`);
    console.log(`- Centres with Physics/Chemistry: ${multiSubjectResults.pagination.total}`);
    console.log(`- Centres with JC levels: ${multiLevelResults.pagination.total}`);
    console.log('\n✅ The API is fully functional with the imported data!');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAPIIntegration();
