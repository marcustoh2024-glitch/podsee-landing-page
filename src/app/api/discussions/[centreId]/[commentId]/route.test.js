import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from './route';
import { generateTestUUID } from '@/lib/testUtils';

describe('Comment Moderation API - Unit Tests', () => {
  let mockDiscussionService;
  let mockAuthService;
  let testCentreId;
  let testCommentId;
  let testAdminId;

  beforeEach(() => {
    // Generate valid UUIDs for each test
    testCentreId = generateTestUUID();
    testCommentId = generateTestUUID();
    testAdminId = generateTestUUID();

    mockDiscussionService = {
      hideComment: vi.fn()
    };

    mockAuthService = {
      validateSession: vi.fn()
    };
  });

  describe('PATCH /api/discussions/[centreId]/[commentId]', () => {
    it('should hide comment when admin provides valid request', async () => {
      const mockAdmin = {
        id: testAdminId,
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      const mockComment = {
        id: testCommentId,
        isHidden: true,
        updatedAt: new Date().toISOString()
      };

      mockAuthService.validateSession.mockResolvedValue(mockAdmin);
      mockDiscussionService.hideComment.mockResolvedValue(mockComment);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}/${testCommentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: true
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: testCentreId,
          commentId: testCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comment.isHidden).toBe(true);
      expect(mockDiscussionService.hideComment).toHaveBeenCalledWith(testCommentId, true);
    });

    it('should unhide comment when admin sets isHidden to false', async () => {
      const mockAdmin = {
        id: testAdminId,
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      const mockComment = {
        id: testCommentId,
        isHidden: false,
        updatedAt: new Date().toISOString()
      };

      mockAuthService.validateSession.mockResolvedValue(mockAdmin);
      mockDiscussionService.hideComment.mockResolvedValue(mockComment);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}/${testCommentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: false
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: testCentreId,
          commentId: testCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comment.isHidden).toBe(false);
    });

    it('should return 401 when authorization header is missing', async () => {
      const request = new Request(`http://localhost/api/discussions/${testCentreId}/${testCommentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHidden: true
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: testCentreId,
          commentId: testCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when non-admin user attempts moderation', async () => {
      const mockParent = {
        id: generateTestUUID(),
        email: 'parent@example.com',
        role: 'PARENT'
      };

      mockAuthService.validateSession.mockResolvedValue(mockParent);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}/${testCommentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer user-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: true
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: testCentreId,
          commentId: testCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 400 for invalid centre ID format', async () => {
      const mockAdmin = {
        id: testAdminId,
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      mockAuthService.validateSession.mockResolvedValue(mockAdmin);

      const request = new Request(`http://localhost/api/discussions/invalid-id/${testCommentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: true
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: 'invalid-id',
          commentId: testCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_ID_FORMAT');
    });

    it('should return 400 for invalid comment ID format', async () => {
      const mockAdmin = {
        id: testAdminId,
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      mockAuthService.validateSession.mockResolvedValue(mockAdmin);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}/invalid-id`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: true
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: testCentreId,
          commentId: 'invalid-id'
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_ID_FORMAT');
    });

    it('should return 404 when comment not found', async () => {
      const mockAdmin = {
        id: testAdminId,
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      const error = new Error('Comment not found');
      error.code = 'COMMENT_NOT_FOUND';

      const nonExistentCentreId = generateTestUUID();
      const nonExistentCommentId = generateTestUUID();

      mockAuthService.validateSession.mockResolvedValue(mockAdmin);
      mockDiscussionService.hideComment.mockRejectedValue(error);

      const request = new Request(`http://localhost/api/discussions/${nonExistentCentreId}/${nonExistentCommentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: true
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: nonExistentCentreId,
          commentId: nonExistentCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('COMMENT_NOT_FOUND');
    });

    it('should return 400 when isHidden is not a boolean', async () => {
      const mockAdmin = {
        id: testAdminId,
        email: 'admin@example.com',
        role: 'ADMIN'
      };

      mockAuthService.validateSession.mockResolvedValue(mockAdmin);

      const request = new Request(`http://localhost/api/discussions/${testCentreId}/${testCommentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isHidden: 'true' // String instead of boolean
        })
      });

      const response = await PATCH(request, {
        params: {
          centreId: testCentreId,
          commentId: testCommentId
        },
        discussionService: mockDiscussionService,
        authService: mockAuthService
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_FIELD_TYPE');
    });
  });
});
