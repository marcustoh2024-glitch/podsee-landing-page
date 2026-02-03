import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { PATCH } from './route.js';
import { PrismaClient } from '@prisma/client';
import AuthService from '@/lib/services/authService.js';
import { generateTestEmail, generateTestUUID } from '@/lib/testUtils.js';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

describe('Feature: community-forum - Comment Moderation API Property Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.tuitionCentreSubject.deleteMany();
    await prisma.tuitionCentreLevel.deleteMany();
    await prisma.tuitionCentre.deleteMany();
    await prisma.user.deleteMany();
  });

  /**
   * Property: PATCH endpoint modifies only isHidden flag
   * For any comment, the PATCH endpoint should only modify the isHidden flag 
   * and leave all other fields unchanged
   * Validates: Requirements 6.1
   */
  it('Property: PATCH endpoint modifies only isHidden flag', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.string({ minLength: 8, maxLength: 20 }).filter(s => s.trim().length >= 8),
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.boolean(),
        fc.boolean(),
        async (name, location, whatsappNumber, password, body, isAnonymous, isHidden) => {
          // Generate unique email for each test run
          const email = generateTestEmail('test');
          
          // Create centre, user, thread, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const thread = await prisma.discussionThread.create({
            data: { tuitionCentreId: centre.id }
          });

          const comment = await prisma.comment.create({
            data: {
              discussionThreadId: thread.id,
              authorId: user.id,
              body,
              isAnonymous,
              isHidden: false
            }
          });

          // Store original values
          const originalBody = comment.body;
          const originalAuthorId = comment.authorId;
          const originalIsAnonymous = comment.isAnonymous;
          const originalThreadId = comment.discussionThreadId;

          // Create admin user and authenticate
          const adminEmail = `admin-${Date.now()}@test.com`;
          const { token } = await authService.authenticate(adminEmail, password, 'ADMIN');

          // Create mock request
          const mockHeaders = new Map([
            ['authorization', `Bearer ${token}`]
          ]);

          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}/${comment.id}`,
            headers: {
              get: (key) => mockHeaders.get(key)
            },
            json: async () => ({ isHidden })
          };

          const mockParams = {
            params: { 
              centreId: centre.id,
              commentId: comment.id
            }
          };

          // Call PATCH endpoint
          const response = await PATCH(mockRequest, mockParams);
          const data = await response.json();

          // Verify response
          expect(response.status).toBe(200);
          expect(data.comment.isHidden).toBe(isHidden);

          // Verify only isHidden was modified
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(dbComment.body).toBe(originalBody);
          expect(dbComment.authorId).toBe(originalAuthorId);
          expect(dbComment.isAnonymous).toBe(originalIsAnonymous);
          expect(dbComment.discussionThreadId).toBe(originalThreadId);
          expect(dbComment.isHidden).toBe(isHidden);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property: PATCH endpoint requires admin role
   * For any non-admin user, the PATCH endpoint should reject the request 
   * with 403 status
   * Validates: Requirements 6.1
   */
  it('Property: PATCH endpoint requires admin role', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }).filter(s => s.trim().length >= 8),
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.constantFrom('PARENT', 'CENTRE'),
        async (name, location, whatsappNumber, email, password, body, role) => {
          // Create centre, user, thread, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const thread = await prisma.discussionThread.create({
            data: { tuitionCentreId: centre.id }
          });

          const comment = await prisma.comment.create({
            data: {
              discussionThreadId: thread.id,
              authorId: user.id,
              body,
              isAnonymous: false,
              isHidden: false
            }
          });

          // Create non-admin user and authenticate
          const nonAdminEmail = `user-${Date.now()}@test.com`;
          const { token } = await authService.authenticate(nonAdminEmail, password, role);

          // Create mock request
          const mockHeaders = new Map([
            ['authorization', `Bearer ${token}`]
          ]);

          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}/${comment.id}`,
            headers: {
              get: (key) => mockHeaders.get(key)
            },
            json: async () => ({ isHidden: true })
          };

          const mockParams = {
            params: { 
              centreId: centre.id,
              commentId: comment.id
            }
          };

          // Call PATCH endpoint
          const response = await PATCH(mockRequest, mockParams);
          const data = await response.json();

          // Verify rejection
          expect(response.status).toBe(403);
          expect(data.error).toBeDefined();
          expect(data.error.code).toBe('INSUFFICIENT_PERMISSIONS');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property: PATCH endpoint validates UUID format
   * For any invalid UUID format, the PATCH endpoint should reject the request 
   * with 400 status
   * Validates: Requirements 6.1
   */
  it('Property: PATCH endpoint validates UUID format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }).filter(s => s.trim().length >= 8),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)),
        async (email, password, invalidId) => {
          // Create admin user and authenticate
          const { token } = await authService.authenticate(email, password, 'ADMIN');

          // Create mock request with invalid ID
          const mockHeaders = new Map([
            ['authorization', `Bearer ${token}`]
          ]);

          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${invalidId}/${invalidId}`,
            headers: {
              get: (key) => mockHeaders.get(key)
            },
            json: async () => ({ isHidden: true })
          };

          const mockParams = {
            params: { 
              centreId: invalidId,
              commentId: invalidId
            }
          };

          // Call PATCH endpoint
          const response = await PATCH(mockRequest, mockParams);
          const data = await response.json();

          // Verify rejection
          expect(response.status).toBe(400);
          expect(data.error).toBeDefined();
          expect(data.error.code).toBe('INVALID_ID_FORMAT');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
