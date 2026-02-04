import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from './route';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    offering: {
      count: vi.fn()
    },
    level: {
      findMany: vi.fn()
    },
    subject: {
      findMany: vi.fn()
    }
  }
}));

import { prisma } from '@/lib/prisma';

describe('Filter Options API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    delete process.env.ENABLE_OFFERING_FILTERS;
  });
  
  describe('Feature flag disabled', () => {
    it('should return disabled when feature flag is false', async () => {
      process.env.ENABLE_OFFERING_FILTERS = 'false';
      prisma.offering.count.mockResolvedValue(100);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.enabled).toBe(false);
      expect(data.levels).toEqual([]);
      expect(data.subjects).toEqual([]);
      expect(data.reason).toBe('Feature flag disabled');
    });
    
    it('should return disabled when feature flag is not set', async () => {
      // Feature flag not set (undefined)
      prisma.offering.count.mockResolvedValue(100);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.enabled).toBe(false);
      expect(data.reason).toBe('Feature flag disabled');
    });
  });
  
  describe('No offerings data', () => {
    it('should return disabled when no offerings exist', async () => {
      process.env.ENABLE_OFFERING_FILTERS = 'true';
      prisma.offering.count.mockResolvedValue(0);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.enabled).toBe(false);
      expect(data.levels).toEqual([]);
      expect(data.subjects).toEqual([]);
      expect(data.reason).toBe('No offerings data available');
    });
  });
  
  describe('Filters enabled', () => {
    beforeEach(() => {
      process.env.ENABLE_OFFERING_FILTERS = 'true';
      prisma.offering.count.mockResolvedValue(100);
    });
    
    it('should return available levels and subjects', async () => {
      prisma.level.findMany.mockResolvedValue([
        { name: 'Primary 1' },
        { name: 'Secondary 1' }
      ]);
      
      prisma.subject.findMany.mockResolvedValue([
        { name: 'Mathematics' },
        { name: 'English' }
      ]);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.enabled).toBe(true);
      expect(data.levels).toEqual(['Primary 1', 'Secondary 1']);
      expect(data.subjects).toEqual(['Mathematics', 'English']);
      expect(data.reason).toBeUndefined();
    });
    
    it('should only return levels with offerings', async () => {
      prisma.level.findMany.mockResolvedValue([
        { name: 'Primary 1' }
      ]);
      
      prisma.subject.findMany.mockResolvedValue([
        { name: 'Mathematics' }
      ]);
      
      const response = await GET();
      const data = await response.json();
      
      // Verify the query filters for levels with offerings
      expect(prisma.level.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            offerings: {
              some: {}
            }
          }
        })
      );
      
      expect(data.levels).toEqual(['Primary 1']);
    });
    
    it('should only return subjects with offerings', async () => {
      prisma.level.findMany.mockResolvedValue([]);
      prisma.subject.findMany.mockResolvedValue([
        { name: 'Mathematics' }
      ]);
      
      const response = await GET();
      const data = await response.json();
      
      // Verify the query filters for subjects with offerings
      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            offerings: {
              some: {}
            }
          }
        })
      );
      
      expect(data.subjects).toEqual(['Mathematics']);
    });
    
    it('should return empty arrays when no levels/subjects have offerings', async () => {
      prisma.level.findMany.mockResolvedValue([]);
      prisma.subject.findMany.mockResolvedValue([]);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.enabled).toBe(true);
      expect(data.levels).toEqual([]);
      expect(data.subjects).toEqual([]);
    });
  });
  
  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      process.env.ENABLE_OFFERING_FILTERS = 'true';
      prisma.offering.count.mockRejectedValue(new Error('Database error'));
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
