import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from './route';
import TuitionCentreService from '@/lib/services/tuitionCentreService';
import { prisma, cleanupTestData } from '@/lib/testUtils';

const service = new TuitionCentreService(prisma);

/**
 * Console Error Tests
 * Ensures no console errors are logged during normal empty state operations
 */

describe('Console Error Tests - No Errors in Empty States', () => {
  let consoleErrorSpy;

  beforeEach(async () => {
    await cleanupTestData();
    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await cleanupTestData();
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should not log console errors when returning empty results', async () => {
    const request = new Request('http://localhost/api/tuition-centres?search=NonExistent');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    
    // No console errors should be logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should not log console errors when no centres exist in database', async () => {
    const request = new Request('http://localhost/api/tuition-centres');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    
    // No console errors should be logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should not log console errors for page beyond total pages', async () => {
    const request = new Request('http://localhost/api/tuition-centres?page=999');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    
    // No console errors should be logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should not log console errors for non-matching filters', async () => {
    const request = new Request('http://localhost/api/tuition-centres?levels=NonExistent&subjects=NonExistent');
    const response = await GET(request, { tuitionCentreService: service });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    
    // No console errors should be logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should only log errors for actual server errors, not empty results', async () => {
    // Test normal empty result - should not log
    const request1 = new Request('http://localhost/api/tuition-centres?search=xyz');
    await GET(request1, { tuitionCentreService: service });
    
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Test with invalid service to trigger actual error - should log
    const brokenService = {
      searchTuitionCentres: () => {
        throw new Error('Database connection failed');
      }
    };

    const request2 = new Request('http://localhost/api/tuition-centres');
    const response2 = await GET(request2, { tuitionCentreService: brokenService });
    
    expect(response2.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Verify error message contains context
    const errorCall = consoleErrorSpy.mock.calls[0];
    expect(errorCall[0]).toContain('Error in GET /api/tuition-centres');
  });
});
