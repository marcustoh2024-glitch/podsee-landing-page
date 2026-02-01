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

// Helper to create a test centre
async function createTestCentre(data = {}) {
  return await prisma.tuitionCentre.create({
    data: {
      name: data.name || 'Test Centre',
      location: data.location || 'Test Location',
      whatsappNumber: data.whatsappNumber || '+6591234567',
      website: data.website || null
    }
  });
}

// UUID generator for fast-check
const uuidArbitrary = fc.uuid();

describe('GET /api/tuition-centres/:id - Property-Based Tests', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  // Feature: tuition-search-backend, Property 9: ID lookup returns single or none
  it('Property 9: For any tuition centre ID, querying by that ID should return exactly one matching centre or a 404 error', async () => {
    // Create some test centres
    const centres = [];
    for (let i = 0; i < 5; i++) {
      const centre = await createTestCentre({
        name: `Centre ${i}`,
        location: `Location ${i}`,
        whatsappNumber: `+659123456${i}`
      });
      centres.push(centre);
    }

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Test with existing IDs
          fc.constantFrom(...centres.map(c => c.id)),
          // Test with random UUIDs (likely non-existent)
          uuidArbitrary
        ),
        async (id) => {
          // Make request with the ID
          const request = new Request(`http://localhost/api/tuition-centres/${id}`);
          const response = await GET(request, { params: { id }, tuitionCentreService: service });
          const data = await response.json();

          // Check if this ID exists in our test centres
          const existingCentre = centres.find(c => c.id === id);

          if (existingCentre) {
            // Property 1: Should return 200 for existing IDs
            expect(response.status).toBe(200);

            // Property 2: Should return exactly one centre
            expect(data).toHaveProperty('id');
            expect(data.id).toBe(id);

            // Property 3: Should have all required fields
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('location');
            expect(data).toHaveProperty('whatsappNumber');
            expect(data).toHaveProperty('whatsappLink');
            expect(data).toHaveProperty('levels');
            expect(data).toHaveProperty('subjects');
          } else {
            // Property 4: Should return 404 for non-existent IDs
            expect(response.status).toBe(404);
            expect(data).toHaveProperty('error');
            expect(data.error.code).toBe('NOT_FOUND');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: tuition-search-backend, Property 10: Required fields are always present
  it('Property 10: For any tuition centre returned by the API, name, location, and whatsappNumber should always be non-null and non-empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          location: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          whatsappNumber: fc.string({ minLength: 8, maxLength: 15 }).map(s => `+65${s.replace(/\D/g, '').slice(0, 8)}`),
          website: fc.option(fc.webUrl(), { nil: null })
        }),
        async (centreData) => {
          // Create a test centre with the generated data
          const centre = await createTestCentre(centreData);

          // Query the centre by ID
          const request = new Request(`http://localhost/api/tuition-centres/${centre.id}`);
          const response = await GET(request, { params: { id: centre.id }, tuitionCentreService: service });
          const data = await response.json();

          // Property 1: Response should be successful
          expect(response.status).toBe(200);

          // Property 2: Required fields should always be present
          expect(data.name).toBeDefined();
          expect(data.location).toBeDefined();
          expect(data.whatsappNumber).toBeDefined();

          // Property 3: Required fields should be non-null
          expect(data.name).not.toBeNull();
          expect(data.location).not.toBeNull();
          expect(data.whatsappNumber).not.toBeNull();

          // Property 4: Required fields should be non-empty strings
          expect(typeof data.name).toBe('string');
          expect(typeof data.location).toBe('string');
          expect(typeof data.whatsappNumber).toBe('string');
          expect(data.name.length).toBeGreaterThan(0);
          expect(data.location.length).toBeGreaterThan(0);
          expect(data.whatsappNumber.length).toBeGreaterThan(0);

          // Property 5: WhatsApp link should be generated
          expect(data.whatsappLink).toBeDefined();
          expect(typeof data.whatsappLink).toBe('string');
          expect(data.whatsappLink).toMatch(/^https:\/\/wa\.me\/\d+$/);

          // Clean up
          await prisma.tuitionCentre.delete({ where: { id: centre.id } });
        }
      ),
      { numRuns: 100 }
    );
  });
});
