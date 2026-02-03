import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { generateTestUUID } from '@/lib/testUtils';

describe('Discussion API Endpoints - Unit Tests', () => {
  let mockDiscussionService;
  let mockAuthService;
  let testCentreId;
  let testThreadId;
  let testUserId;
  let testCommentId;

  beforeEach(() => {
    // Generate valid UUIDs for each test
    testCentreId = generateTestUUID();
    testThreadId = generateTestUUID();
    testUserId = generateTestUUID();
    testCommentId = generateTestUUID();

    mockDiscussionService = {
      getOrCreateThread: vi.fn(),
      getComments: vi.fn(),
      createComment: vi.fn()
    };

    mockAuthService = {
      validateSession: vi.fn()
    };
  });

  describe('GET /api/discussions/[centreId]', () => {
    it('should return thread and comments for valid centre ID', async () => {
      const mockThread = {
        id: testThreadId,
        tuitionCentreId: testCentreId,
        tuitionCentre: {
          id: testCentreId,
          name: 'Test Centre',
          location: 'Tampines'
        },
        createdAt: new Date().toISOString()
      };

      const mockComments = [
        {
          id: testCommentId,
          body: 'Great centre!',
          isAnonymous: false,
          author: {
            id: testUserId,
            email: 'parent@example.com',
            role: 'PARENT'
          },
          createdAt: new Date().toISOString()
        }
      ];

      mockDiscussionService.getOrCreateThread.mockResolvedValue(mockThread);
      mockDiscussionService.getComments.mockResolvedValue(mockComments);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}`);
      const response = await GET(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.thread).toEqual(mockThread);
      expect(data.comments).toEqual(mockComments);
    });

    it('should return 400 for invalid UUID format', async () => {
      const request = new Request('http://localhost/api/discussions/invalid-id');
      const response = await GET(request, {
        params: { centreId: 'invalid-id' },
        discussionService: mockDiscussionService
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_ID_FORMAT');
    });

    it('should return 404 when centre not found', async () => {
      const error = new Error('Tuition centre not found');
      error.code = 'CENTRE_NOT_FOUND';
      mockDiscussionService.getOrCreateThread.mockRejectedValue(error);

      const nonExistentId = generateTestUUID();
      const request = new Request(`http://localhost/api/discussions/${nonExistentId}`);
      const response = await GET(request, {
        params: { centreId: nonExistentId },
        discussionService: mockDiscussionService
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('CENTRE_NOT_FOUND');
    });

    it('should allow unauthenticated access', async () => {
      const mockThread = {
        id: testThreadId,
        tuitionCentreId: testCentreId,
        createdAt: new Date().toISOString()
      };

      mockDiscussionService.getOrCreateThread.mockResolvedValue(mockThread);
      mockDiscussionService.getComments.mockResolvedValue([]);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}`);
      const response = await GET(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService
      });

      expect(response.status).toBe(200);
      // No authentication check should be performed
    });
  });

  describe('POST /api/discussions/[centreId]', () => {
    it('should create comment with valid authentication and data', async () => {
      const mockUser = {
        id: testUserId,
        email: 'parent@example.com',
        role: 'PARENT'
      };

      const mockThread = {
        id: testThreadId,
        tuitionCentreId: testCentreId
      };

      const mockComment = {
        id: testCommentId,
        body: 'This is a test comment',
        isAnonymous: false,
        author: mockUser,
        createdAt: new Date().toISOString()
      };

      mockAuthService.validateSession.mockResolvedValue(mockUser);
      mockDiscussionService.getOrCreateThread.mockResolvedValue(mockThread);
      mockDiscussionService.createComment.mockResolvedValue(mockComment);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: 'This is a test comment',
          isAnonymous: false
        })
      });

      const response = await POST(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.comment).toEqual(mockComment);
    });

    it('should return 401 when authorization header is missing', async () => {
      const request = new Request(`http://localhost/api/discussions/${testCentreId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: 'Test comment',
          isAnonymous: false
        })
      });

      const response = await POST(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when centre tries to post anonymously', async () => {
      const mockUser = {
        id: generateTestUUID(),
        email: 'centre@example.com',
        role: 'CENTRE'
      };

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: 'Test comment',
          isAnonymous: true
        })
      });

      const response = await POST(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN_ANONYMOUS_CENTRE');
    });

    it('should return 400 when body is missing', async () => {
      const mockUser = {
        id: testUserId,
        email: 'parent@example.com',
        role: 'PARENT'
      };

      mockAuthService.validateSession.mockResolvedValue(mockUser);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isAnonymous: false
        })
      });

      const response = await POST(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_FIELDS');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new Request(`http://localhost/api/discussions/${testCentreId}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: 'invalid json {'
      });

      const response = await POST(request, {
        params: { centreId: testCentreId },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_REQUEST_BODY');
    });
  });
});
