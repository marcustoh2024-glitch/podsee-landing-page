import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from './route';
import { PrismaClient } from '@prisma/client';
import TuitionCentreService from '@/lib/services/tuitionCentreService';

const prisma = new PrismaClient();
const service = new TuitionCentreService(prisma);

/**
 * Empty State Tests
 * Ensures graceful handling when no centres match filters
 * Requirements: No 500s, no crashes, no console errors
 */

// Helper to clean up test data
async function cleanupTestData() {
  await prisma.comment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
}

// Helper to create test centres
async function createTestCentres() {
  // Create levels and subjects
  const primaryLevel = await prisma.level.create({ data: { name: 'Primary' } });
  const secondaryLevel = await prisma.level.create({ data: { name: 'Secondary' } });
  const mathSubject = await prisma.subject.create({ data: { name: 'Mathematics' } });
  const scienceSubject = await prisma.subject.create({ data: { name: 'Science' } });

  // Create test centres
  await prisma.tuitionCentre.create({
    data: {
      name: 'Alpha Learning Centre',
      location: 'Tampines',
      whatsappNumber: '+6591234567',
      website: 'https://alpha.com',
      levels: {
        create: [{ level: { connect: { id: primaryLevel.id } } }]
      },
      subjects: {
        create: [{ subject: { connect: { id: mathSubject.id } } }]
      }
    }
  });

  await prisma.tuitionCentre.create({
    data: {
      name: 'Beta Education Hub',
      location: 'Jurong',
      whatsappNumber: '+6592345678',
      website: 'https://beta.com',
      levels: {
        create: [{ level: { connect: { id: secondaryLevel.id } } }]
      },
      subjects: {
        create: [{ subject: { connect: { id: scienceSubject.id } } }]
      }
    }
  });
}

describe('Empty State Tests - Graceful Handling', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should return empty array with correct metadata when no centres exist', async () => {
    // No centres in database
    const request = new Request('http://localhost/api/tuition-centres');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    // Should return 200, not 500
    expect(response.status).toBe(200);

    // Should return empty array
    expect(data.data).toEqual([]);

    // Should have correct pagination metadata
    expect(data.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    });
  });

  it('should return empty array when search term matches no centres', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?search=NonExistentCentre');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
    expect(data.pagination.totalPages).toBe(0);
  });

  it('should return empty array when level filter matches no centres', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?levels=Junior College');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it('should return empty array when subject filter matches no centres', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?subjects=Physics');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it('should return empty array when combined filters match no centres', async () => {
    await createTestCentres();

    // Alpha has Primary + Math, Beta has Secondary + Science
    // Search for Primary + Science (no match)
    const request = new Request('http://localhost/api/tuition-centres?levels=Primary&subjects=Science');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.total).toBe(0);
  });

  it('should return empty array when page exceeds total pages', async () => {
    await createTestCentres();

    // Only 2 centres exist, page 10 should be empty
    const request = new Request('http://localhost/api/tuition-centres?page=10&limit=10');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.pagination.page).toBe(10);
    expect(data.pagination.total).toBe(2);
    expect(data.pagination.totalPages).toBe(1);
  });

  it('should handle empty search string gracefully', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?search=');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    // Empty search should return all centres
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(2);
    expect(data.pagination.total).toBe(2);
  });

  it('should handle whitespace-only search gracefully', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?search=%20%20%20');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    // Whitespace search should return all centres
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(2);
  });

  it('should handle empty levels array gracefully', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?levels=');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    // Empty levels should return all centres
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(2);
  });

  it('should handle empty subjects array gracefully', async () => {
    await createTestCentres();

    const request = new Request('http://localhost/api/tuition-centres?subjects=');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    // Empty subjects should return all centres
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(2);
  });

  it('should not throw errors or return 500 for any empty state', async () => {
    await createTestCentres();

    const testCases = [
      'http://localhost/api/tuition-centres?search=xyz',
      'http://localhost/api/tuition-centres?levels=NonExistent',
      'http://localhost/api/tuition-centres?subjects=NonExistent',
      'http://localhost/api/tuition-centres?page=999',
      'http://localhost/api/tuition-centres?search=xyz&levels=NonExistent&subjects=NonExistent',
    ];

    for (const url of testCases) {
      const request = new Request(url);
      const response = await GET(request, { tuitionCentreService: service });
      const data = await response.json();

      // Should never return 500
      expect(response.status).toBe(200);
      
      // Should always have proper structure
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      
      // Pagination should be valid
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
    }
  });

  it('should maintain consistent response structure for empty and non-empty results', async () => {
    await createTestCentres();

    // Get non-empty result
    const request1 = new Request('http://localhost/api/tuition-centres');
    const response1 = await GET(request1, { tuitionCentreService: service });
    const data1 = await response1.json();

    // Get empty result
    const request2 = new Request('http://localhost/api/tuition-centres?search=NonExistent');
    const response2 = await GET(request2, { tuitionCentreService: service });
    const data2 = await response2.json();

    // Both should have same structure
    expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort());
    expect(Object.keys(data1.pagination).sort()).toEqual(Object.keys(data2.pagination).sort());
  });
});
