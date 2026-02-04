import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { GET } from './route';

/**
 * Integration tests for offering-based filtering
 * Tests the complete flow from API to database with real data
 */
describe('Tuition Centres API - Offering Filters Integration', () => {
  let testCentres = [];
  let testLevels = [];
  let testSubjects = [];
  let testOfferings = [];
  
  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.offering.deleteMany({
      where: {
        tuitionCentre: {
          name: {
            startsWith: 'TEST_'
          }
        }
      }
    });
    
    await prisma.tuitionCentre.deleteMany({
      where: {
        name: {
          startsWith: 'TEST_'
        }
      }
    });
    
    await prisma.level.deleteMany({
      where: {
        name: {
          startsWith: 'TEST_'
        }
      }
    });
    
    await prisma.subject.deleteMany({
      where: {
        name: {
          startsWith: 'TEST_'
        }
      }
    });
    
    // Create test levels
    testLevels = await Promise.all([
      prisma.level.create({ data: { name: 'TEST_Primary 1' } }),
      prisma.level.create({ data: { name: 'TEST_Secondary 1' } }),
      prisma.level.create({ data: { name: 'TEST_Secondary 2' } })
    ]);
    
    // Create test subjects
    testSubjects = await Promise.all([
      prisma.subject.create({ data: { name: 'TEST_Mathematics' } }),
      prisma.subject.create({ data: { name: 'TEST_English' } }),
      prisma.subject.create({ data: { name: 'TEST_Physics' } })
    ]);
    
    // Create test centres
    testCentres = await Promise.all([
      prisma.tuitionCentre.create({
        data: {
          name: 'TEST_Centre A',
          location: 'TEST_Location A',
          whatsappNumber: '12345678'
        }
      }),
      prisma.tuitionCentre.create({
        data: {
          name: 'TEST_Centre B',
          location: 'TEST_Location B',
          whatsappNumber: '87654321'
        }
      }),
      prisma.tuitionCentre.create({
        data: {
          name: 'TEST_Centre C',
          location: 'TEST_Location C',
          whatsappNumber: '11111111'
        }
      })
    ]);
    
    // Create offerings
    // Centre A: Primary 1 Math, Primary 1 English
    // Centre B: Secondary 1 Math, Secondary 1 Physics
    // Centre C: Secondary 2 Math, Secondary 2 English
    testOfferings = await Promise.all([
      // Centre A
      prisma.offering.create({
        data: {
          tuitionCentreId: testCentres[0].id,
          levelId: testLevels[0].id, // Primary 1
          subjectId: testSubjects[0].id // Math
        }
      }),
      prisma.offering.create({
        data: {
          tuitionCentreId: testCentres[0].id,
          levelId: testLevels[0].id, // Primary 1
          subjectId: testSubjects[1].id // English
        }
      }),
      // Centre B
      prisma.offering.create({
        data: {
          tuitionCentreId: testCentres[1].id,
          levelId: testLevels[1].id, // Secondary 1
          subjectId: testSubjects[0].id // Math
        }
      }),
      prisma.offering.create({
        data: {
          tuitionCentreId: testCentres[1].id,
          levelId: testLevels[1].id, // Secondary 1
          subjectId: testSubjects[2].id // Physics
        }
      }),
      // Centre C
      prisma.offering.create({
        data: {
          tuitionCentreId: testCentres[2].id,
          levelId: testLevels[2].id, // Secondary 2
          subjectId: testSubjects[0].id // Math
        }
      }),
      prisma.offering.create({
        data: {
          tuitionCentreId: testCentres[2].id,
          levelId: testLevels[2].id, // Secondary 2
          subjectId: testSubjects[1].id // English
        }
      })
    ]);
  });
  
  afterAll(async () => {
    // Clean up test data
    await prisma.offering.deleteMany({
      where: {
        id: {
          in: testOfferings.map(o => o.id)
        }
      }
    });
    
    await prisma.tuitionCentre.deleteMany({
      where: {
        id: {
          in: testCentres.map(c => c.id)
        }
      }
    });
    
    await prisma.level.deleteMany({
      where: {
        id: {
          in: testLevels.map(l => l.id)
        }
      }
    });
    
    await prisma.subject.deleteMany({
      where: {
        id: {
          in: testSubjects.map(s => s.id)
        }
      }
    });
  });
  
  beforeEach(() => {
    // Enable feature flag for tests
    process.env.ENABLE_OFFERING_FILTERS = 'true';
  });
  
  describe('No filters', () => {
    it('should return all test centres when no filters applied', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Should include all test centres
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      expect(testCentreNames).toContain('TEST_Centre A');
      expect(testCentreNames).toContain('TEST_Centre B');
      expect(testCentreNames).toContain('TEST_Centre C');
    });
  });
  
  describe('Level-only filtering', () => {
    it('should return only centres with Primary 1 offerings', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?levels=TEST_Primary%201&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      expect(testCentreNames).toContain('TEST_Centre A');
      expect(testCentreNames).not.toContain('TEST_Centre B');
      expect(testCentreNames).not.toContain('TEST_Centre C');
    });
    
    it('should return only centres with Secondary 1 offerings', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?levels=TEST_Secondary%201&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      expect(testCentreNames).not.toContain('TEST_Centre A');
      expect(testCentreNames).toContain('TEST_Centre B');
      expect(testCentreNames).not.toContain('TEST_Centre C');
    });
  });
  
  describe('Subject-only filtering', () => {
    it('should return centres offering Mathematics', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?subjects=TEST_Mathematics&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      // All centres offer Math
      expect(testCentreNames).toContain('TEST_Centre A');
      expect(testCentreNames).toContain('TEST_Centre B');
      expect(testCentreNames).toContain('TEST_Centre C');
    });
    
    it('should return centres offering Physics', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?subjects=TEST_Physics&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      // Only Centre B offers Physics
      expect(testCentreNames).not.toContain('TEST_Centre A');
      expect(testCentreNames).toContain('TEST_Centre B');
      expect(testCentreNames).not.toContain('TEST_Centre C');
    });
  });
  
  describe('Level + Subject intersection', () => {
    it('should return centres with Secondary 1 Math', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?levels=TEST_Secondary%201&subjects=TEST_Mathematics&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      // Only Centre B has Secondary 1 Math
      expect(testCentreNames).not.toContain('TEST_Centre A');
      expect(testCentreNames).toContain('TEST_Centre B');
      expect(testCentreNames).not.toContain('TEST_Centre C');
    });
    
    it('should return centres with Primary 1 English', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?levels=TEST_Primary%201&subjects=TEST_English&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      // Only Centre A has Primary 1 English
      expect(testCentreNames).toContain('TEST_Centre A');
      expect(testCentreNames).not.toContain('TEST_Centre B');
      expect(testCentreNames).not.toContain('TEST_Centre C');
    });
    
    it('should return empty when no centre matches intersection', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?levels=TEST_Primary%201&subjects=TEST_Physics&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      // No centre has Primary 1 Physics
      expect(testCentreNames).toHaveLength(0);
    });
  });
  
  describe('Feature flag disabled', () => {
    it('should ignore filters when feature flag is off', async () => {
      process.env.ENABLE_OFFERING_FILTERS = 'false';
      
      const request = new Request('http://localhost:3000/api/tuition-centres?levels=TEST_Secondary%201&subjects=TEST_Physics&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentreNames = data.data
        .filter(c => c.name.startsWith('TEST_'))
        .map(c => c.name);
      
      // Should return all centres (filters ignored)
      expect(testCentreNames).toContain('TEST_Centre A');
      expect(testCentreNames).toContain('TEST_Centre B');
      expect(testCentreNames).toContain('TEST_Centre C');
    });
  });
  
  describe('Pagination with filters', () => {
    it('should return correct total count with filters', async () => {
      const request = new Request('http://localhost:3000/api/tuition-centres?subjects=TEST_Mathematics&limit=100');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      const testCentresCount = data.data.filter(c => c.name.startsWith('TEST_')).length;
      
      // All 3 test centres offer Math
      expect(testCentresCount).toBe(3);
    });
  });
});
