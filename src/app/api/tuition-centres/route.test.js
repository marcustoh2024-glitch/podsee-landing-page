import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

describe('GET /api/tuition-centres', () => {
  let mockService;

  beforeEach(() => {
    // Create a fresh mock service for each test
    mockService = {
      searchTuitionCentres: vi.fn()
    };
  });

  describe('Query Parameter Parsing', () => {
    it('should parse search parameter correctly', async () => {
      mockService.searchTuitionCentres.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      const request = new Request('http://localhost/api/tuition-centres?search=tampines');
      await GET(request, { tuitionCentreService: mockService });

      expect(mockService.searchTuitionCentres).toHaveBeenCalledWith({
        search: 'tampines',
        levels: undefined,
        subjects: undefined,
        page: 1,
        limit: 20
      });
    });

    it('should parse levels parameter as comma-separated array', async () => {
      mockService.searchTuitionCentres.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      const request = new Request('http://localhost/api/tuition-centres?levels=Primary,Secondary');
      await GET(request, { tuitionCentreService: mockService });

      expect(mockService.searchTuitionCentres).toHaveBeenCalledWith({
        search: undefined,
        levels: ['Primary', 'Secondary'],
        subjects: undefined,
        page: 1,
        limit: 20
      });
    });

    it('should parse subjects parameter as comma-separated array', async () => {
      mockService.searchTuitionCentres.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      const request = new Request('http://localhost/api/tuition-centres?subjects=Mathematics,Science');
      await GET(request, { tuitionCentreService: mockService });

      expect(mockService.searchTuitionCentres).toHaveBeenCalledWith({
        search: undefined,
        levels: undefined,
        subjects: ['Mathematics', 'Science'],
        page: 1,
        limit: 20
      });
    });

    it('should parse page and limit parameters as integers', async () => {
      mockService.searchTuitionCentres.mockResolvedValue({
        data: [],
        pagination: { page: 2, limit: 50, total: 0, totalPages: 0 }
      });

      const request = new Request('http://localhost/api/tuition-centres?page=2&limit=50');
      await GET(request, { tuitionCentreService: mockService });

      expect(mockService.searchTuitionCentres).toHaveBeenCalledWith({
        search: undefined,
        levels: undefined,
        subjects: undefined,
        page: 2,
        limit: 50
      });
    });

    it('should use default values when page and limit are not provided', async () => {
      mockService.searchTuitionCentres.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      const request = new Request('http://localhost/api/tuition-centres');
      await GET(request, { tuitionCentreService: mockService });

      expect(mockService.searchTuitionCentres).toHaveBeenCalledWith({
        search: undefined,
        levels: undefined,
        subjects: undefined,
        page: 1,
        limit: 20
      });
    });
  });

  describe('Validation Error Responses', () => {
    it('should return 400 for negative page number', async () => {
      const request = new Request('http://localhost/api/tuition-centres?page=-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_PAGE');
      expect(data.error.message).toContain('positive integer');
    });

    it('should return 400 for page = 0', async () => {
      const request = new Request('http://localhost/api/tuition-centres?page=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_PAGE');
    });

    it('should return 400 for non-numeric page', async () => {
      const request = new Request('http://localhost/api/tuition-centres?page=abc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_PAGE');
    });

    it('should return 400 for negative limit', async () => {
      const request = new Request('http://localhost/api/tuition-centres?limit=-10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_LIMIT');
    });

    it('should return 400 for limit exceeding 100', async () => {
      const request = new Request('http://localhost/api/tuition-centres?limit=150');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('LIMIT_EXCEEDED');
      expect(data.error.message).toContain('cannot exceed 100');
    });

    it('should return 400 for non-numeric limit', async () => {
      const request = new Request('http://localhost/api/tuition-centres?limit=xyz');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_LIMIT');
    });
  });

  describe('Successful Search Responses', () => {
    it('should return 200 with data and pagination for successful search', async () => {
      const mockData = [
        {
          id: '1',
          name: 'ABC Learning Centre',
          location: 'Tampines',
          whatsappNumber: '+6591234567',
          whatsappLink: 'https://wa.me/6591234567',
          website: 'https://abc.com',
          levels: [{ id: 'l1', name: 'Primary' }],
          subjects: [{ id: 's1', name: 'Mathematics' }]
        }
      ];

      mockSearchTuitionCentres.mockResolvedValue({
        data: mockData,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
      });

      const request = new Request('http://localhost/api/tuition-centres?search=tampines');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockData);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      });
    });

    it('should return empty array when no results match', async () => {
      mockSearchTuitionCentres.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      const request = new Request('http://localhost/api/tuition-centres?search=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('Pagination Metadata', () => {
    it('should return correct pagination metadata for first page', async () => {
      mockSearchTuitionCentres.mockResolvedValue({
        data: new Array(20).fill({}),
        pagination: { page: 1, limit: 20, total: 45, totalPages: 3 }
      });

      const request = new Request('http://localhost/api/tuition-centres?page=1&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3
      });
    });

    it('should return correct pagination metadata for middle page', async () => {
      mockSearchTuitionCentres.mockResolvedValue({
        data: new Array(20).fill({}),
        pagination: { page: 2, limit: 20, total: 45, totalPages: 3 }
      });

      const request = new Request('http://localhost/api/tuition-centres?page=2&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.page).toBe(2);
      expect(data.pagination.total).toBe(45);
    });

    it('should return correct pagination metadata for last page with partial results', async () => {
      mockSearchTuitionCentres.mockResolvedValue({
        data: new Array(5).fill({}),
        pagination: { page: 3, limit: 20, total: 45, totalPages: 3 }
      });

      const request = new Request('http://localhost/api/tuition-centres?page=3&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toEqual({
        page: 3,
        limit: 20,
        total: 45,
        totalPages: 3
      });
      expect(data.data.length).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      const dbError = new Error('Database connection failed');
      dbError.code = 'P1001'; // Prisma error code
      mockSearchTuitionCentres.mockRejectedValue(dbError);

      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('DATABASE_ERROR');
    });

    it('should return 500 for unexpected errors', async () => {
      mockSearchTuitionCentres.mockRejectedValue(new Error('Unexpected error'));

      const request = new Request('http://localhost/api/tuition-centres');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
