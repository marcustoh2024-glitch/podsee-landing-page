import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fc } from 'fast-check';
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
  
  // Create or get levels
  const levelRecords = await Promise.all(
    levels.map(async (levelName) => {
      return await prisma.level.upsert({
        where: { name: levelName },
        update: {},
        create: { name: levelName }
      });
    })
  );

  // Create or get subjects
  const subjectRecords = await Promise.all(
    subjects.map(async (subjectName) => {
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
            name: fc.string({ minLength: 3, maxLength: 50 }),
            location: fc.string({ minLength: 3, maxLength: 50 }),
            whatsappNumber: fc.string({ minLength: 8, maxLength: 15 }),
            website: fc.option(fc.webUrl(), { nil: null }),
            levels: fc.array(fc.constantFrom('Primary', 'Secondary', 'Junior College'), { minLength: 1, maxLength: 3 }),
            subjects: fc.array(fc.constantFrom('Mathematics', 'Science', 'English'), { minLength: 1, maxLength: 3 })
          }),
          { minLength: 5, maxLength: 10 }
        ),
        fc.nat({ max: 100 }).map(n => n.toString()),
        async (centres, searchIndex) => {
          // Create test centres
          const createdCentres = await Promise.all(
            centres.map(centre => createTestCentre(centre))
          );

          if (createdCentres.length === 0) return true;

          // Pick a random centre and extract a search term from it
          const targetCentre = createdCentres[parseInt(searchIndex) % createdCentres.length];
          const searchTerm = targetCentre.name.substring(0, 3);

          // Search with the term
          const result = await service.searchTuitionCentres({ search: searchTerm });

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
      { numRuns: 100 }
    );
  });
});
