import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to clean up test data
async function cleanupTestData() {
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
}

// Helper to create test data
async function setupTestData() {
  // Create levels
  const primary = await prisma.level.create({ data: { name: 'Primary' } });
  const secondary = await prisma.level.create({ data: { name: 'Secondary' } });
  const jc = await prisma.level.create({ data: { name: 'Junior College' } });

  // Create subjects
  const math = await prisma.subject.create({ data: { name: 'Mathematics' } });
  const science = await prisma.subject.create({ data: { name: 'Science' } });
  const english = await prisma.subject.create({ data: { name: 'English' } });

  // Create tuition centres
  const centre1 = await prisma.tuitionCentre.create({
    data: {
      name: 'Alpha Learning Centre',
      location: 'Tampines',
      whatsappNumber: '+6591234567',
      website: 'https://alpha.com',
      levels: {
        create: [
          { level: { connect: { id: primary.id } } },
          { level: { connect: { id: secondary.id } } }
        ]
      },
      subjects: {
        create: [
          { subject: { connect: { id: math.id } } },
          { subject: { connect: { id: science.id } } }
        ]
      }
    }
  });

  const centre2 = await prisma.tuitionCentre.create({
    data: {
      name: 'Beta Education Hub',
      location: 'Jurong',
      whatsappNumber: '+6598765432',
      website: null,
      levels: {
        create: [
          { level: { connect: { id: secondary.id } } },
          { level: { connect: { id: jc.id } } }
        ]
      },
      subjects: {
        create: [
          { subject: { connect: { id: math.id } } },
          { subject: { connect: { id: english.id } } }
        ]
      }
    }
  });

  const centre3 = await prisma.tuitionCentre.create({
    data: {
      name: 'Gamma Academy',
      location: 'Bedok',
      whatsappNumber: '+6587654321',
      website: 'https://gamma.sg',
      levels: {
        create: [
          { level: { connect: { id: primary.id } } }
        ]
      },
      subjects: {
        create: [
          { subject: { connect: { id: english.id } } },
          { subject: { connect: { id: science.id } } }
        ]
      }
    }
  });

  return { centres: [centre1, centre2, centre3], levels: { primary, secondary, jc }, subjects: { math, science, english } };
}

describe('Integration Tests - Full API Flow', () => {
  let testData;

  beforeAll(async () => {
    await cleanupTestData();
    testData = await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('GET /api/tuition-centres - Search and Filter', () => {
    it('should return all centres when no filters are applied', async () => {
      // Import the route handler
      const { GET } = await import('./route.js');
      
      // Create request
      const request = new Request('http://localhost/api/tuition-centres');
      
      // Call the handler
      const response = await GET(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(3);
      expect(data.pagination.total).toBe(3);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
    });

    it('should filter by search term', async () => {
      const { GET } = await import('./route.js');
      
      // Search for "Alpha"
      const request = new Request('http://localhost/api/tuition-centres?search=Alpha');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Alpha Learning Centre');
    });

    it('should filter by level', async () => {
      const { GET } = await import('./route.js');
      
      // Filter by Primary level
      const request = new Request(`http://localhost/api/tuition-centres?levels=Primary`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2); // Alpha and Gamma
      
      // Verify all results have Primary level
      for (const centre of data.data) {
        const hasPrimary = centre.levels.some(l => l.name === 'Primary');
        expect(hasPrimary).toBe(true);
      }
    });

    it('should filter by subject', async () => {
      const { GET } = await import('./route.js');
      
      // Filter by English subject
      const request = new Request(`http://localhost/api/tuition-centres?subjects=English`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2); // Beta and Gamma
      
      // Verify all results have English subject
      for (const centre of data.data) {
        const hasEnglish = centre.subjects.some(s => s.name === 'English');
        expect(hasEnglish).toBe(true);
      }
    });

    it('should combine search and filters with AND logic', async () => {
      const { GET } = await import('./route.js');
      
      // Search for "Learning" AND filter by Primary level
      const request = new Request(`http://localhost/api/tuition-centres?search=Learning&levels=Primary`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Alpha Learning Centre');
    });

    it('should handle pagination correctly', async () => {
      const { GET } = await import('./route.js');
      
      // Request page 1 with limit 2
      const request1 = new Request('http://localhost/api/tuition-centres?page=1&limit=2');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.data).toHaveLength(2);
      expect(data1.pagination.page).toBe(1);
      expect(data1.pagination.limit).toBe(2);
      expect(data1.pagination.total).toBe(3);
      expect(data1.pagination.totalPages).toBe(2);

      // Request page 2 with limit 2
      const request2 = new Request('http://localhost/api/tuition-centres?page=2&limit=2');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.data).toHaveLength(1);
      expect(data2.pagination.page).toBe(2);
    });

    it('should return empty results for non-matching filters', async () => {
      const { GET } = await import('./route.js');
      
      // Search for non-existent centre
      const request = new Request('http://localhost/api/tuition-centres?search=NonExistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });

    it('should include WhatsApp links in response', async () => {
      const { GET } = await import('./route.js');
      
      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify all centres have WhatsApp links
      for (const centre of data.data) {
        expect(centre.whatsappLink).toBeDefined();
        expect(centre.whatsappLink).toMatch(/^https:\/\/wa\.me\/\d+$/);
      }
    });
  });

  describe('GET /api/tuition-centres/:id - Get by ID', () => {
    it('should return centre details for valid ID', async () => {
      const { GET } = await import('./[id]/route.js');
      
      const centreId = testData.centres[0].id;
      const request = new Request(`http://localhost/api/tuition-centres/${centreId}`);
      const response = await GET(request, { params: { id: centreId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(centreId);
      expect(data.name).toBe('Alpha Learning Centre');
      expect(data.location).toBe('Tampines');
      expect(data.whatsappNumber).toBe('+6591234567');
      expect(data.website).toBe('https://alpha.com');
      expect(data.whatsappLink).toMatch(/^https:\/\/wa\.me\/\d+$/);
      expect(data.levels).toHaveLength(2);
      expect(data.subjects).toHaveLength(2);
    });

    it('should return 404 for non-existent ID', async () => {
      const { GET } = await import('./[id]/route.js');
      
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const request = new Request(`http://localhost/api/tuition-centres/${fakeId}`);
      const response = await GET(request, { params: { id: fakeId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid ID format', async () => {
      const { GET } = await import('./[id]/route.js');
      
      const invalidId = 'not-a-uuid';
      const request = new Request(`http://localhost/api/tuition-centres/${invalidId}`);
      const response = await GET(request, { params: { id: invalidId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('INVALID_ID_FORMAT');
    });

    it('should handle centres without websites', async () => {
      const { GET } = await import('./[id]/route.js');
      
      // Beta Education Hub has no website
      const centreId = testData.centres[1].id;
      const request = new Request(`http://localhost/api/tuition-centres/${centreId}`);
      const response = await GET(request, { params: { id: centreId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.website).toBeNull();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid pagination parameters', async () => {
      const { GET } = await import('./route.js');
      
      // Invalid page (negative)
      const request1 = new Request('http://localhost/api/tuition-centres?page=-1');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(response1.status).toBe(400);
      expect(data1.error).toBeDefined();
    });

    it('should handle limit exceeding maximum', async () => {
      const { GET } = await import('./route.js');
      
      // Limit exceeds 100
      const request = new Request('http://localhost/api/tuition-centres?limit=150');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const { GET } = await import('./route.js');
      const TuitionCentreService = (await import('@/lib/services/tuitionCentreService')).default;
      
      // Create a mock service that throws a Prisma error
      const mockService = new TuitionCentreService();
      mockService.searchTuitionCentres = async () => {
        const error = new Error('Database connection failed');
        error.code = 'P1001'; // Prisma connection error code
        throw error;
      };
      
      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request, { tuitionCentreService: mockService });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between centres and levels', async () => {
      const { GET } = await import('./route.js');
      
      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify all centres have valid level relationships
      for (const centre of data.data) {
        expect(centre.levels).toBeDefined();
        expect(Array.isArray(centre.levels)).toBe(true);
        expect(centre.levels.length).toBeGreaterThan(0);
        
        // Verify each level has id and name
        for (const level of centre.levels) {
          expect(level.id).toBeDefined();
          expect(level.name).toBeDefined();
        }
      }
    });

    it('should maintain referential integrity between centres and subjects', async () => {
      const { GET } = await import('./route.js');
      
      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify all centres have valid subject relationships
      for (const centre of data.data) {
        expect(centre.subjects).toBeDefined();
        expect(Array.isArray(centre.subjects)).toBe(true);
        expect(centre.subjects.length).toBeGreaterThan(0);
        
        // Verify each subject has id and name
        for (const subject of centre.subjects) {
          expect(subject.id).toBeDefined();
          expect(subject.name).toBeDefined();
        }
      }
    });

    it('should ensure all required fields are present', async () => {
      const { GET } = await import('./route.js');
      
      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify all centres have required fields
      for (const centre of data.data) {
        expect(centre.id).toBeDefined();
        expect(centre.name).toBeDefined();
        expect(centre.location).toBeDefined();
        expect(centre.whatsappNumber).toBeDefined();
        expect(centre.whatsappLink).toBeDefined();
        expect(centre.levels).toBeDefined();
        expect(centre.subjects).toBeDefined();
        
        // Verify required fields are non-empty
        expect(centre.name.length).toBeGreaterThan(0);
        expect(centre.location.length).toBeGreaterThan(0);
        expect(centre.whatsappNumber.length).toBeGreaterThan(0);
      }
    });
  });
});
