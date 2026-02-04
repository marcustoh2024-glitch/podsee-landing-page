import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

describe('API Parameter Handling - Backwards Compatibility', () => {
  let mockService;

  beforeEach(() => {
    mockService = {
      searchTuitionCentres: vi.fn().mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      })
    };
  });

  it('should accept singular "level" parameter', async () => {
    const request = new Request('http://localhost/api/tuition-centres?level=Secondary');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Secondary']
      })
    );
  });

  it('should accept plural "levels" parameter', async () => {
    const request = new Request('http://localhost/api/tuition-centres?levels=Secondary');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Secondary']
      })
    );
  });

  it('should accept singular "subject" parameter', async () => {
    const request = new Request('http://localhost/api/tuition-centres?subject=Mathematics');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        subjects: ['Mathematics']
      })
    );
  });

  it('should accept plural "subjects" parameter', async () => {
    const request = new Request('http://localhost/api/tuition-centres?subjects=Mathematics');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        subjects: ['Mathematics']
      })
    );
  });

  it('should prefer plural over singular when both provided', async () => {
    const request = new Request('http://localhost/api/tuition-centres?level=Primary&levels=Secondary');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Secondary'] // plural takes precedence
      })
    );
  });

  it('should handle comma-separated values', async () => {
    const request = new Request('http://localhost/api/tuition-centres?levels=Primary,Secondary&subjects=Mathematics,Science');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Primary', 'Secondary'],
        subjects: ['Mathematics', 'Science']
      })
    );
  });

  it('should handle mixed singular/plural parameters', async () => {
    const request = new Request('http://localhost/api/tuition-centres?level=Secondary&subject=Mathematics');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Secondary'],
        subjects: ['Mathematics']
      })
    );
  });

  it('should trim whitespace from parameters', async () => {
    const request = new Request('http://localhost/api/tuition-centres?levels= Secondary , Primary &subjects= Mathematics ');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Secondary', 'Primary'],
        subjects: ['Mathematics']
      })
    );
  });

  it('should filter out empty strings', async () => {
    const request = new Request('http://localhost/api/tuition-centres?levels=Secondary,,Primary&subjects=,Mathematics,');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: ['Secondary', 'Primary'],
        subjects: ['Mathematics']
      })
    );
  });

  it('should handle no filter parameters', async () => {
    const request = new Request('http://localhost/api/tuition-centres');
    
    await GET(request, { tuitionCentreService: mockService });

    expect(mockService.searchTuitionCentres).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: undefined,
        subjects: undefined
      })
    );
  });
});
