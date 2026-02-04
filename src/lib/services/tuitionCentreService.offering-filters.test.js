import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TuitionCentreService from './tuitionCentreService';

/**
 * Test suite for offering-based filtering
 * Tests the exact-match, intersection-based filtering logic
 */
describe('TuitionCentreService - Offering Filters', () => {
  let service;
  let mockPrisma;
  
  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      tuitionCentre: {
        count: vi.fn(),
        findMany: vi.fn()
      },
      offering: {
        count: vi.fn()
      }
    };
    
    service = new TuitionCentreService(mockPrisma);
    
    // Set feature flag to enabled for these tests
    process.env.ENABLE_OFFERING_FILTERS = 'true';
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Stage 0: Fallback when offerings unavailable', () => {
    it('should ignore filters when feature flag is disabled', async () => {
      process.env.ENABLE_OFFERING_FILTERS = 'false';
      
      mockPrisma.tuitionCentre.count.mockResolvedValue(10);
      mockPrisma.offering.count.mockResolvedValue(100);
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        levels: ['Secondary 1'],
        subjects: ['Mathematics'],
        page: 1,
        limit: 20
      });
      
      // Should query without level/subject filters
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      expect(whereClause).toEqual({});
    });
    
    it('should ignore filters when no offerings exist', async () => {
      mockPrisma.tuitionCentre.count.mockResolvedValue(10);
      mockPrisma.offering.count.mockResolvedValue(0); // No offerings
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        levels: ['Secondary 1'],
        subjects: ['Mathematics'],
        page: 1,
        limit: 20
      });
      
      // Should query without level/subject filters
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      expect(whereClause).toEqual({});
    });
    
    it('should return all centres when no filters applied', async () => {
      mockPrisma.tuitionCentre.count.mockResolvedValue(10);
      mockPrisma.offering.count.mockResolvedValue(100);
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([
        {
          id: '1',
          name: 'Centre A',
          location: 'Location A',
          whatsappNumber: '12345678',
          website: null,
          levels: [],
          subjects: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      const result = await service.searchTuitionCentres({
        page: 1,
        limit: 20
      });
      
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(10);
    });
  });
  
  describe('Stage 2: Offering-based filtering', () => {
    beforeEach(() => {
      // Setup: offerings exist
      mockPrisma.offering.count.mockResolvedValue(100);
      mockPrisma.tuitionCentre.count.mockResolvedValue(10);
    });
    
    it('should filter by level only', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        levels: ['Secondary 1'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      
      // Should have offerings filter with level condition
      expect(whereClause).toHaveProperty('AND');
      expect(whereClause.AND).toHaveLength(1);
      expect(whereClause.AND[0]).toHaveProperty('offerings');
      expect(whereClause.AND[0].offerings.some).toHaveProperty('level');
    });
    
    it('should filter by subject only', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        subjects: ['Mathematics'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      
      // Should have offerings filter with subject condition
      expect(whereClause).toHaveProperty('AND');
      expect(whereClause.AND).toHaveLength(1);
      expect(whereClause.AND[0]).toHaveProperty('offerings');
      expect(whereClause.AND[0].offerings.some).toHaveProperty('subject');
    });
    
    it('should filter by level AND subject (intersection)', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        levels: ['Secondary 1'],
        subjects: ['Mathematics'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      
      // Should have offerings filter with AND condition
      expect(whereClause).toHaveProperty('AND');
      expect(whereClause.AND).toHaveLength(1);
      expect(whereClause.AND[0]).toHaveProperty('offerings');
      expect(whereClause.AND[0].offerings.some).toHaveProperty('AND');
      expect(whereClause.AND[0].offerings.some.AND).toHaveLength(2);
    });
    
    it('should expand grouped level names', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        levels: ['Secondary'], // Grouped name
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      const levelCondition = whereClause.AND[0].offerings.some.level.OR;
      
      // Should expand to Secondary 1, 2, 3, 4
      expect(levelCondition).toBeDefined();
      expect(levelCondition.length).toBeGreaterThan(4); // At least 4 levels * 2 (id + name)
    });
    
    it('should support multiple levels', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        levels: ['Primary 1', 'Primary 2'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      const levelCondition = whereClause.AND[0].offerings.some.level.OR;
      
      // Should have conditions for both levels (id + name for each)
      expect(levelCondition).toBeDefined();
      expect(levelCondition.length).toBeGreaterThanOrEqual(4);
    });
    
    it('should support multiple subjects', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        subjects: ['Mathematics', 'English'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      const subjectCondition = whereClause.AND[0].offerings.some.subject.OR;
      
      // Should have conditions for both subjects (id + name for each)
      expect(subjectCondition).toBeDefined();
      expect(subjectCondition.length).toBeGreaterThanOrEqual(4);
    });
    
    it('should combine search with filters', async () => {
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        search: 'Marine Parade',
        levels: ['Secondary 1'],
        subjects: ['Mathematics'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      
      // Should have both search and offerings filters
      expect(whereClause.AND).toHaveLength(2);
      expect(whereClause.AND[0]).toHaveProperty('OR'); // Search condition
      expect(whereClause.AND[1]).toHaveProperty('offerings'); // Filter condition
    });
  });
  
  describe('Pagination', () => {
    beforeEach(() => {
      mockPrisma.offering.count.mockResolvedValue(100);
    });
    
    it('should return correct pagination metadata', async () => {
      mockPrisma.tuitionCentre.count.mockResolvedValue(45);
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      const result = await service.searchTuitionCentres({
        page: 2,
        limit: 20
      });
      
      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3
      });
    });
    
    it('should calculate correct skip value', async () => {
      mockPrisma.tuitionCentre.count.mockResolvedValue(100);
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
      
      await service.searchTuitionCentres({
        page: 3,
        limit: 20
      });
      
      const callArgs = mockPrisma.tuitionCentre.findMany.mock.calls[0][0];
      expect(callArgs.skip).toBe(40); // (3-1) * 20
      expect(callArgs.take).toBe(20);
    });
  });
  
  describe('Exact matching', () => {
    beforeEach(() => {
      mockPrisma.offering.count.mockResolvedValue(100);
      mockPrisma.tuitionCentre.findMany.mockResolvedValue([]);
    });
    
    it('should use exact string equality for subjects', async () => {
      await service.searchTuitionCentres({
        subjects: ['Biology'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      const subjectCondition = whereClause.AND[0].offerings.some.subject.OR;
      
      // Should check both id and name with equals
      expect(subjectCondition).toContainEqual({ id: 'Biology' });
      expect(subjectCondition).toContainEqual({ name: { equals: 'Biology' } });
    });
    
    it('should not match "Science" when filtering for "Biology"', async () => {
      // This is a behavioral test - we're ensuring no fuzzy matching
      await service.searchTuitionCentres({
        subjects: ['Biology'],
        page: 1,
        limit: 20
      });
      
      const whereClause = mockPrisma.tuitionCentre.findMany.mock.calls[0][0].where;
      const subjectCondition = whereClause.AND[0].offerings.some.subject.OR;
      
      // Should NOT have contains or other fuzzy matching
      subjectCondition.forEach(condition => {
        if (condition.name) {
          expect(condition.name).toHaveProperty('equals');
          expect(condition.name).not.toHaveProperty('contains');
        }
      });
    });
  });
});
