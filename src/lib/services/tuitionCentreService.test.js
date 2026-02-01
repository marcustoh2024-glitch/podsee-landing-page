import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import TuitionCentreService from './tuitionCentreService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

// Helper to clean up test data
async function cleanupTestData() {
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
}

// Helper to create test data
async function createTestCentre(data) {
  const { name, location, whatsappNumber, website, levels = [], subjects = [] } = data;
  
  // Remove duplicates from levels and subjects
  const uniqueLevels = [...new Set(levels)];
  const uniqueSubjects = [...new Set(subjects)];
  
  // Create or get levels
  const levelRecords = await Promise.all(
    uniqueLevels.map(async (levelName) => {
      return await prisma.level.upsert({
        where: { name: levelName },
        update: {},
        create: { name: levelName }
      });
    })
  );

  // Create or get subjects
  const subjectRecords = await Promise.all(
    uniqueSubjects.map(async (subjectName) => {
      return await prisma.subject.upsert({
        where: { name: subjectName },
        update: {},
        create: { name: subjectName }
      });
    })
  );

  // Create tuition centre
  const centre = await prisma.tuitionCentre.create({
    data: {
      name,
      location,
      whatsappNumber,
      website,
      levels: {
        create: levelRecords.map(level => ({
          level: { connect: { id: level.id } }
        }))
      },
      subjects: {
        create: subjectRecords.map(subject => ({
          subject: { connect: { id: subject.id } }
        }))
      }
    }
  });

  return centre;
}

describe('TuitionCentreService - Property Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  // Feature: tuition-search-backend, Property 1: Search returns matching centres
  // Validates: Requirements 2.1, 2.3
  it('Property 1: Search returns matching centres', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            location: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            whatsappNumber: fc.stringMatching(/^\d{8,12}$/),
            website: fc.option(fc.webUrl(), { nil: null }),
            levels: fc.uniqueArray(fc.constantFrom('Primary', 'Secondary', 'Junior College'), { minLength: 1, maxLength: 2 }),
            subjects: fc.uniqueArray(fc.constantFrom('Mathematics', 'Science', 'English'), { minLength: 1, maxLength: 2 })
          }),
          { minLength: 3, maxLength: 5 }
        ),
        fc.nat({ max: 100 }),
        async (centres, searchIndex) => {
          // Create test centres
          const createdCentres = await Promise.all(
            centres.map(centre => createTestCentre(centre))
          );

          if (createdCentres.length === 0) return true;

          // Pick a random centre and extract a search term from it
          const targetCentre = createdCentres[searchIndex % createdCentres.length];
          const searchTerm = targetCentre.name.substring(0, 3).trim();

          if (!searchTerm) return true; // Skip if search term is empty

          // Search with the term (use lowercase for SQLite case-insensitive search)
          const result = await service.searchTuitionCentres({ search: searchTerm.toLowerCase() });

          // Verify all results contain the search term in name or location (case-insensitive)
          const searchLower = searchTerm.toLowerCase();
          for (const centre of result.data) {
            const nameMatch = centre.name.toLowerCase().includes(searchLower);
            const locationMatch = centre.location.toLowerCase().includes(searchLower);
            expect(nameMatch || locationMatch).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // 30 second timeout

  // Feature: tuition-search-backend, Property 3: Level filter returns only matching centres
  // Validates: Requirements 3.1, 3.2
  it('Property 3: Level filter returns only matching centres', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            location: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            whatsappNumber: fc.stringMatching(/^\d{8,12}$/),
            website: fc.option(fc.webUrl(), { nil: null }),
            levels: fc.uniqueArray(fc.constantFrom('Primary', 'Secondary', 'Junior College', 'IB', 'IGCSE'), { minLength: 1, maxLength: 3 }),
            subjects: fc.uniqueArray(fc.constantFrom('Mathematics', 'Science', 'English'), { minLength: 1, maxLength: 2 })
          }),
          { minLength: 3, maxLength: 5 }
        ),
        fc.uniqueArray(fc.constantFrom('Primary', 'Secondary', 'Junior College', 'IB', 'IGCSE'), { minLength: 1, maxLength: 2 }),
        async (centres, filterLevels) => {
          // Create test centres
          await Promise.all(
            centres.map(centre => createTestCentre(centre))
          );

          // Search with level filter
          const result = await service.searchTuitionCentres({ levels: filterLevels });

          // Verify all results have at least one of the specified levels
          for (const centre of result.data) {
            const centreLevelNames = centre.levels.map(l => l.name);
            const hasMatchingLevel = filterLevels.some(filterLevel => 
              centreLevelNames.includes(filterLevel)
            );
            expect(hasMatchingLevel).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // 30 second timeout

  // Feature: tuition-search-backend, Property 4: Subject filter returns only matching centres
  // Validates: Requirements 4.1, 4.2
  it('Property 4: Subject filter returns only matching centres', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            location: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            whatsappNumber: fc.stringMatching(/^\d{8,12}$/),
            website: fc.option(fc.webUrl(), { nil: null }),
            levels: fc.uniqueArray(fc.constantFrom('Primary', 'Secondary', 'Junior College'), { minLength: 1, maxLength: 2 }),
            subjects: fc.uniqueArray(fc.constantFrom('Mathematics', 'Science', 'English', 'Chinese', 'Physics', 'Chemistry'), { minLength: 1, maxLength: 3 })
          }),
          { minLength: 3, maxLength: 5 }
        ),
        fc.uniqueArray(fc.constantFrom('Mathematics', 'Science', 'English', 'Chinese', 'Physics', 'Chemistry'), { minLength: 1, maxLength: 2 }),
        async (centres, filterSubjects) => {
          // Create test centres
          await Promise.all(
            centres.map(centre => createTestCentre(centre))
          );

          // Search with subject filter
          const result = await service.searchTuitionCentres({ subjects: filterSubjects });

          // Verify all results have at least one of the specified subjects
          for (const centre of result.data) {
            const centreSubjectNames = centre.subjects.map(s => s.name);
            const hasMatchingSubject = filterSubjects.some(filterSubject => 
              centreSubjectNames.includes(filterSubject)
            );
            expect(hasMatchingSubject).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // 30 second timeout

  // Feature: tuition-search-backend, Property 5: Combined filters use AND logic between types
  // Validates: Requirements 5.1, 5.2
  it('Property 5: Combined filters use AND logic between types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            location: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            whatsappNumber: fc.stringMatching(/^\d{8,12}$/),
            website: fc.option(fc.webUrl(), { nil: null }),
            levels: fc.uniqueArray(fc.constantFrom('Primary', 'Secondary', 'Junior College'), { minLength: 1, maxLength: 2 }),
            subjects: fc.uniqueArray(fc.constantFrom('Mathematics', 'Science', 'English'), { minLength: 1, maxLength: 2 })
          }),
          { minLength: 5, maxLength: 8 }
        ),
        fc.record({
          search: fc.option(fc.stringMatching(/^[A-Za-z]{2,5}$/), { nil: null }),
          levels: fc.option(fc.uniqueArray(fc.constantFrom('Primary', 'Secondary', 'Junior College'), { minLength: 1, maxLength: 2 }), { nil: null }),
          subjects: fc.option(fc.uniqueArray(fc.constantFrom('Mathematics', 'Science', 'English'), { minLength: 1, maxLength: 2 }), { nil: null })
        }),
        async (centres, filters) => {
          // Create test centres
          await Promise.all(
            centres.map(centre => createTestCentre(centre))
          );

          // Build filter object
          const searchFilters = {};
          if (filters.search) searchFilters.search = filters.search.toLowerCase();
          if (filters.levels) searchFilters.levels = filters.levels;
          if (filters.subjects) searchFilters.subjects = filters.subjects;

          // Skip if no filters applied
          if (Object.keys(searchFilters).length === 0) return true;

          // Search with combined filters
          const result = await service.searchTuitionCentres(searchFilters);

          // Verify all results match ALL filter types (AND logic)
          for (const centre of result.data) {
            // Check search filter if applied
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              const nameMatch = centre.name.toLowerCase().includes(searchLower);
              const locationMatch = centre.location.toLowerCase().includes(searchLower);
              expect(nameMatch || locationMatch).toBe(true);
            }

            // Check level filter if applied
            if (filters.levels) {
              const centreLevelNames = centre.levels.map(l => l.name);
              const hasMatchingLevel = filters.levels.some(filterLevel => 
                centreLevelNames.includes(filterLevel)
              );
              expect(hasMatchingLevel).toBe(true);
            }

            // Check subject filter if applied
            if (filters.subjects) {
              const centreSubjectNames = centre.subjects.map(s => s.name);
              const hasMatchingSubject = filters.subjects.some(filterSubject => 
                centreSubjectNames.includes(filterSubject)
              );
              expect(hasMatchingSubject).toBe(true);
            }
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // 30 second timeout

  // Feature: tuition-search-backend, Property 6: WhatsApp link format is valid
  // Validates: Requirements 7.1, 7.2, 7.4
  it('Property 6: WhatsApp link format is valid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            location: fc.stringMatching(/^[A-Za-z ]{5,20}$/),
            // Generate phone numbers with various formats
            whatsappNumber: fc.oneof(
              fc.stringMatching(/^\+\d{10,12}$/), // +6591234567
              fc.stringMatching(/^\d{8,12}$/), // 91234567
              fc.stringMatching(/^\+\d{1,3} \d{8,10}$/), // +65 91234567
              fc.stringMatching(/^\d{4}-\d{4}$/), // 9123-4567
              fc.stringMatching(/^\(\+\d{2}\) \d{8}$/) // (+65) 91234567
            ),
            website: fc.option(fc.webUrl(), { nil: null }),
            levels: fc.uniqueArray(fc.constantFrom('Primary', 'Secondary'), { minLength: 1, maxLength: 2 }),
            subjects: fc.uniqueArray(fc.constantFrom('Mathematics', 'Science'), { minLength: 1, maxLength: 2 })
          }),
          { minLength: 3, maxLength: 5 }
        ),
        async (centres) => {
          // Create test centres
          await Promise.all(
            centres.map(centre => createTestCentre(centre))
          );

          // Get all centres
          const result = await service.searchTuitionCentres({});

          // Verify all WhatsApp links follow the correct format
          for (const centre of result.data) {
            // WhatsApp link should start with https://wa.me/
            expect(centre.whatsappLink).toMatch(/^https:\/\/wa\.me\/\d+$/);
            
            // Extract the number part
            const numberPart = centre.whatsappLink.replace('https://wa.me/', '');
            
            // Should contain only digits
            expect(numberPart).toMatch(/^\d+$/);
            
            // Should have reasonable length (8-15 digits)
            expect(numberPart.length).toBeGreaterThanOrEqual(8);
            expect(numberPart.length).toBeLessThanOrEqual(15);
          }

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // 30 second timeout
});

// Unit tests for edge cases
describe('TuitionCentreService - Edge Case Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  // Feature: tuition-search-backend, Property 2: Empty search returns all centres
  // Validates: Requirements 2.2
  it('should return all centres when search query is empty', async () => {
    // Create a known set of test centres
    const testCentres = [
      {
        name: 'Alpha Learning',
        location: 'Tampines',
        whatsappNumber: '91234567',
        website: 'https://alpha.com',
        levels: ['Primary'],
        subjects: ['Mathematics']
      },
      {
        name: 'Beta Education',
        location: 'Jurong',
        whatsappNumber: '92345678',
        website: 'https://beta.com',
        levels: ['Secondary'],
        subjects: ['Science']
      },
      {
        name: 'Gamma Academy',
        location: 'Bedok',
        whatsappNumber: '93456789',
        website: null,
        levels: ['Junior College'],
        subjects: ['English']
      }
    ];

    await Promise.all(testCentres.map(centre => createTestCentre(centre)));

    // Search with no search query (empty string)
    const resultEmpty = await service.searchTuitionCentres({ search: '' });
    expect(resultEmpty.data.length).toBe(3);
    expect(resultEmpty.pagination.total).toBe(3);

    // Search with no search query (undefined)
    const resultUndefined = await service.searchTuitionCentres({});
    expect(resultUndefined.data.length).toBe(3);
    expect(resultUndefined.pagination.total).toBe(3);

    // Search with whitespace only
    const resultWhitespace = await service.searchTuitionCentres({ search: '   ' });
    expect(resultWhitespace.data.length).toBe(3);
    expect(resultWhitespace.pagination.total).toBe(3);
  });

  // Feature: tuition-search-backend, Property 11: Filter with no matches returns empty array
  // Validates: Requirements 2.5, 5.4
  it('should return empty array with total 0 when no centres match filters', async () => {
    // Create test centres with specific characteristics
    const testCentres = [
      {
        name: 'Alpha Learning',
        location: 'Tampines',
        whatsappNumber: '91234567',
        website: 'https://alpha.com',
        levels: ['Primary'],
        subjects: ['Mathematics']
      },
      {
        name: 'Beta Education',
        location: 'Jurong',
        whatsappNumber: '92345678',
        website: 'https://beta.com',
        levels: ['Secondary'],
        subjects: ['Science']
      }
    ];

    await Promise.all(testCentres.map(centre => createTestCentre(centre)));

    // Search with non-matching search term
    const resultSearch = await service.searchTuitionCentres({ search: 'NonExistentCentre' });
    expect(resultSearch.data).toEqual([]);
    expect(resultSearch.pagination.total).toBe(0);
    expect(resultSearch.pagination.totalPages).toBe(0);

    // Filter with non-matching level
    const resultLevel = await service.searchTuitionCentres({ levels: ['Junior College'] });
    expect(resultLevel.data).toEqual([]);
    expect(resultLevel.pagination.total).toBe(0);

    // Filter with non-matching subject
    const resultSubject = await service.searchTuitionCentres({ subjects: ['Physics'] });
    expect(resultSubject.data).toEqual([]);
    expect(resultSubject.pagination.total).toBe(0);

    // Combined filters with no matches
    const resultCombined = await service.searchTuitionCentres({ 
      search: 'Alpha',
      levels: ['Secondary'] // Alpha only has Primary
    });
    expect(resultCombined.data).toEqual([]);
    expect(resultCombined.pagination.total).toBe(0);
  });

  // Validates: Requirements 8.3
  it('should return null for website field when centre has no website', async () => {
    // Create centres with and without websites
    const testCentres = [
      {
        name: 'Alpha Learning',
        location: 'Tampines',
        whatsappNumber: '91234567',
        website: 'https://alpha.com',
        levels: ['Primary'],
        subjects: ['Mathematics']
      },
      {
        name: 'Beta Education',
        location: 'Jurong',
        whatsappNumber: '92345678',
        website: null, // No website
        levels: ['Secondary'],
        subjects: ['Science']
      },
      {
        name: 'Gamma Academy',
        location: 'Bedok',
        whatsappNumber: '93456789',
        // website field not provided (undefined)
        levels: ['Junior College'],
        subjects: ['English']
      }
    ];

    const createdCentres = await Promise.all(testCentres.map(centre => createTestCentre(centre)));

    // Get all centres
    const result = await service.searchTuitionCentres({});

    // Find centres without websites
    const betaCentre = result.data.find(c => c.name === 'Beta Education');
    const gammaCentre = result.data.find(c => c.name === 'Gamma Academy');
    const alphaCentre = result.data.find(c => c.name === 'Alpha Learning');

    // Verify centres without websites have null website field
    expect(betaCentre.website).toBeNull();
    expect(gammaCentre.website).toBeNull();

    // Verify centre with website has the correct value
    expect(alphaCentre.website).toBe('https://alpha.com');
  });

  // Validates: Requirements 3.4, 4.4
  it('should return all centres when no level or subject filters are applied', async () => {
    // Create centres with different levels and subjects
    const testCentres = [
      {
        name: 'Alpha Learning',
        location: 'Tampines',
        whatsappNumber: '91234567',
        website: 'https://alpha.com',
        levels: ['Primary'],
        subjects: ['Mathematics']
      },
      {
        name: 'Beta Education',
        location: 'Jurong',
        whatsappNumber: '92345678',
        website: 'https://beta.com',
        levels: ['Secondary', 'Junior College'],
        subjects: ['Science', 'Physics']
      },
      {
        name: 'Gamma Academy',
        location: 'Bedok',
        whatsappNumber: '93456789',
        website: null,
        levels: ['IB', 'IGCSE'],
        subjects: ['English', 'Chemistry']
      }
    ];

    await Promise.all(testCentres.map(centre => createTestCentre(centre)));

    // Search with no level filter (only subject filter)
    const resultNoLevel = await service.searchTuitionCentres({ subjects: ['Mathematics'] });
    expect(resultNoLevel.data.length).toBeGreaterThan(0);
    // Should return Alpha which has Mathematics
    const alphaInResult = resultNoLevel.data.some(c => c.name === 'Alpha Learning');
    expect(alphaInResult).toBe(true);

    // Search with no subject filter (only level filter)
    const resultNoSubject = await service.searchTuitionCentres({ levels: ['Primary'] });
    expect(resultNoSubject.data.length).toBeGreaterThan(0);
    // Should return Alpha which has Primary
    const alphaInResult2 = resultNoSubject.data.some(c => c.name === 'Alpha Learning');
    expect(alphaInResult2).toBe(true);

    // Search with no filters at all
    const resultNoFilters = await service.searchTuitionCentres({});
    expect(resultNoFilters.data.length).toBe(3);
    expect(resultNoFilters.pagination.total).toBe(3);

    // Verify all centres are returned
    const centreNames = resultNoFilters.data.map(c => c.name).sort();
    expect(centreNames).toEqual(['Alpha Learning', 'Beta Education', 'Gamma Academy']);
  });
});
