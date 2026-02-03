import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { GET, POST } from './route.js';
import { PrismaClient } from '@prisma/client';
import AuthService from '@/lib/services/authService.js';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

describe('Feature: community-forum - Discussion API Endpoints Property Tests', () => {
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
   * Property: GET endpoint returns correct data format for any valid centre
   * For any valid tuition centre, the GET endpoint should return a thread 
   * and comments array in the correct format
   * Validates: Requirements 3.1
   */
  it('Property: GET endpoint returns correct data format for any valid centre', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        async (name, location, whatsappNumber) => {
          // Create a tuition centre
          const centre = await prisma.tuitionCentre.create({
            data: {
              name,
              location,
              whatsappNumber
            }
          });

          // Create mock request
          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}`
          };

          const mockParams = {
            params: { centreId: centre.id }
          };

          // Call GET endpoint
          const response = await GET(mockRequest, mockParams);
          const data = await response.json();

          // Verify response format
          expect(response.status).toBe(200);
          expect(data).toHaveProperty('thread');
          expect(data).toHaveProperty('comments');
          expect(data.thread).toHaveProperty('id');
          expect(data.thread).toHaveProperty('tuitionCentreId');
          expect(data.thread.tuitionCentreId).toBe(centre.id);
          expect(Array.isArray(data.comments)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property: POST endpoint creates comments for any valid input
   * For any authenticated user with valid comment data, the POST endpoint 
   * should create and return a comment
   * Validates: Requirements 4.1
   */
  it('Property: POST endpoint creates comments for any valid input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }).filter(s => s.trim().length >= 8),
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        async (name, location, whatsappNumber, email, password, body, isAnonymous) => {
          // Create a tuition centre
          const centre = await prisma.tuitionCentre.create({
            data: {
              name,
              location,
              whatsappNumber
            }
          });

          // Create and authenticate user
          const { token } = await authService.authenticate(email, password, 'PARENT');

          // Create mock request
          const mockHeaders = new Map([
            ['authorization', `Bearer ${token}`]
          ]);

          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}`,
            headers: {
              get: (key) => mockHeaders.get(key)
            },
            json: async () => ({ body, isAnonymous })
          };

          const mockParams = {
            params: { centreId: centre.id }
          };

          // Call POST endpoint
          const response = await POST(mockRequest, mockParams);
          const data = await response.json();

          // Verify response
          expect(response.status).toBe(201);
          expect(data).toHaveProperty('comment');
          expect(data.comment).toHaveProperty('id');
          expect(data.comment).toHaveProperty('body');
          expect(data.comment.isAnonymous).toBe(isAnonymous);

          // Verify comment was created in database
          const dbComment = await prisma.comment.findUnique({
            where: { id: data.comment.id }
          });

          expect(dbComment).toBeDefined();
          expect(dbComment.body).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property: POST endpoint rejects centre anonymous attempts
   * For any centre account attempting to post anonymously, the POST endpoint 
   * should reject the request with 403 status
   * Validates: Requirements 5.2
   */
  it('Property: POST endpoint rejects centre anonymous attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, password, body) => {
          // Create a tuition centre
          const centre = await prisma.tuitionCentre.create({
            data: {
              name,
              location,
              whatsappNumber
            }
          });

          // Create and authenticate centre user
          const { token } = await authService.authenticate(email, password, 'CENTRE');

          // Create mock request with isAnonymous = true
          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}`,
            headers: new Map([
              ['authorization', `Bearer ${token}`]
            ]),
            json: async () => ({ body, isAnonymous: true })
          };

          mockRequest.headers.get = function(key) {
            return this.get(key);
          };

          const mockParams = {
            params: { centreId: centre.id }
          };

          // Call POST endpoint
          const response = await POST(mockRequest, mockParams);
          const data = await response.json();

          // Verify rejection
          expect(response.status).toBe(403);
          expect(data.error).toBeDefined();
          expect(data.error.code).toBe('FORBIDDEN_ANONYMOUS_CENTRE');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property: GET endpoint excludes hidden comments
   * For any discussion thread with hidden comments, the GET endpoint 
   * should only return non-hidden comments
   * Validates: Requirements 3.1, 6.2
   */
  it('Property: GET endpoint excludes hidden comments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
        async (name, location, whatsappNumber, email, commentBodies) => {
          // Create centre and user
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

          // Create thread
          const thread = await prisma.discussionThread.create({
            data: { tuitionCentreId: centre.id }
          });

          // Create comments
          const comments = [];
          for (const body of commentBodies) {
            const comment = await prisma.comment.create({
              data: {
                discussionThreadId: thread.id,
                authorId: user.id,
                body,
                isAnonymous: false,
                isHidden: false
              }
            });
            comments.push(comment);
          }

          // Hide some comments
          const hiddenCount = Math.floor(comments.length / 2);
          for (let i = 0; i < hiddenCount; i++) {
            await prisma.comment.update({
              where: { id: comments[i].id },
              data: { isHidden: true }
            });
          }

          // Create mock request
          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}`
          };

          const mockParams = {
            params: { centreId: centre.id }
          };

          // Call GET endpoint
          const response = await GET(mockRequest, mockParams);
          const data = await response.json();

          // Verify only non-hidden comments are returned
          expect(data.comments.length).toBe(comments.length - hiddenCount);
          data.comments.forEach(comment => {
            expect(comment.isHidden).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property: POST endpoint rejects whitespace-only comments
   * For any string composed entirely of whitespace, the POST endpoint 
   * should reject the comment with 400 status
   * Validates: Requirements 4.3
   */
  it('Property: POST endpoint rejects whitespace-only comments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/\S/g, ' ')),
        async (name, location, whatsappNumber, email, password, whitespaceBody) => {
          // Create a tuition centre
          const centre = await prisma.tuitionCentre.create({
            data: {
              name,
              location,
              whatsappNumber
            }
          });

          // Create and authenticate user
          const { token } = await authService.authenticate(email, password, 'PARENT');

          // Create mock request with whitespace-only body
          const mockRequest = {
            url: `http://localhost:3000/api/discussions/${centre.id}`,
            headers: new Map([
              ['authorization', `Bearer ${token}`]
            ]),
            json: async () => ({ body: whitespaceBody, isAnonymous: false })
          };

          mockRequest.headers.get = function(key) {
            return this.get(key);
          };

          const mockParams = {
            params: { centreId: centre.id }
          };

          // Call POST endpoint
          const response = await POST(mockRequest, mockParams);
          const data = await response.json();

          // Verify rejection
          expect(response.status).toBe(400);
          expect(data.error).toBeDefined();
          expect(data.error.code).toBe('INVALID_COMMENT_BODY');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
