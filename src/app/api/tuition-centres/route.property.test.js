import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { GET } from './route';
import { PrismaClient } from '@prisma/client';
import TuitionCentreService from '@/lib/services/tuitionCentreService';

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

// Helper to create test centres
async function createTestCentres(count) {
  const centres = [];
  
  for (let i = 0; i < count; i++) {
    const centre = await prisma.tuitionCentre.create({
      data: {
        name: `Test Centre ${i}`,
        location: `Location ${i}`,
        whatsappNumber: `+6591234${String(i).padStart(3, '0')}`
      }
    });
    centres.push(centre);
  }
  
  return centres;
}

describe('GET /api/tuition-centres - Property-Based Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  // Feature: tuition-search-backend, Property 8: Pagination consistency
  it('Property 8: For any valid page and limit, result count should not exceed limit and metadata should be accurate', async () => {
    // Create a known number of test centres
    const totalCentres = 45;
    await createTestCentres(totalCentres);

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // page
        fc.integer({ min: 1, max: 100 }), // limit
        async (page, limit) => {
          // Make request with generated page and limit
          const request = new Request(`http://localhost/api/tuition-centres?page=${page}&limit=${limit}`);
          const response = await GET(request, { tuitionCentreService: service });
          const data = await response.json();

          // Property 1: Response should be successful
          expect(response.status).toBe(200);

          // Property 2: Result count should not exceed limit
          expect(data.data.length).toBeLessThanOrEqual(limit);

          // Property 3: Pagination metadata should be accurate
          expect(data.pagination.page).toBe(page);
          expect(data.pagination.limit).toBe(limit);
          expect(data.pagination.total).toBe(totalCentres);

          // Property 4: Total pages should be correctly calculated
          const expectedTotalPages = Math.ceil(totalCentres / limit);
          expect(data.pagination.totalPages).toBe(expectedTotalPages);

          // Property 5: If page is beyond total pages, should return empty array
          if (page > expectedTotalPages) {
            expect(data.data.length).toBe(0);
          }

          // Property 6: If page is within range, should return correct number of items
          if (page <= expectedTotalPages) {
            const expectedCount = Math.min(limit, totalCentres - (page - 1) * limit);
            expect(data.data.length).toBe(expectedCount);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: Pagination should be consistent across multiple requests
  it('Property 8b: Pagination should return consistent results for the same parameters', async () => {
    // Create test centres
    await createTestCentres(30);

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // page
        fc.integer({ min: 5, max: 20 }), // limit
        async (page, limit) => {
          // Make the same request twice
          const request1 = new Request(`http://localhost/api/tuition-centres?page=${page}&limit=${limit}`);
          const request2 = new Request(`http://localhost/api/tuition-centres?page=${page}&limit=${limit}`);
          
          const response1 = await GET(request1, { tuitionCentreService: service });
          const response2 = await GET(request2, { tuitionCentreService: service });
          
          const data1 = await response1.json();
          const data2 = await response2.json();

          // Results should be identical
          expect(data1.data.length).toBe(data2.data.length);
          expect(data1.pagination).toEqual(data2.pagination);
          
          // IDs should match
          const ids1 = data1.data.map(c => c.id).sort();
          const ids2 = data2.data.map(c => c.id).sort();
          expect(ids1).toEqual(ids2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
