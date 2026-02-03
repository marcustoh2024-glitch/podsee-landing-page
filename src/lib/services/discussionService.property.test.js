import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import DiscussionService from './discussionService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const discussionService = new DiscussionService(prisma);

describe('Feature: community-forum - DiscussionService Property Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tuitionCentreSubject.deleteMany();
    await prisma.tuitionCentreLevel.deleteMany();
    await prisma.tuitionCentre.deleteMany();
  });

  /**
   * Property 4: One thread per centre invariant
   * For any tuition centre in the system, querying its discussion threads 
   * should return exactly one thread
   * Validates: Requirements 2.1, 2.2
   */
  it('Property 4: One thread per centre invariant', async () => {
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

          // Call getOrCreateThread multiple times
          const thread1 = await discussionService.getOrCreateThread(centre.id);
          const thread2 = await discussionService.getOrCreateThread(centre.id);
          const thread3 = await discussionService.getOrCreateThread(centre.id);

          // All calls should return the same thread
          expect(thread1.id).toBe(thread2.id);
          expect(thread2.id).toBe(thread3.id);

          // Verify only one thread exists in database
          const threads = await prisma.discussionThread.findMany({
            where: { tuitionCentreId: centre.id }
          });

          expect(threads.length).toBe(1);
          expect(threads[0].id).toBe(thread1.id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 5: Thread retrieval returns correct thread
   * For any tuition centre, retrieving its discussion thread should return 
   * the thread associated with that specific centre
   * Validates: Requirements 2.3
   */
  it('Property 5: Thread retrieval returns correct thread', async () => {
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

          // Get or create thread
          const thread = await discussionService.getOrCreateThread(centre.id);

          // Verify thread is associated with correct centre
          expect(thread.tuitionCentreId).toBe(centre.id);
          expect(thread.tuitionCentre).toBeDefined();
          expect(thread.tuitionCentre.id).toBe(centre.id);
          expect(thread.tuitionCentre.name).toBe(name);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 6: Threads cannot be deleted
   * For any discussion thread, attempting to delete it should fail and 
   * the thread should remain in the database
   * Validates: Requirements 2.4
   */
  it('Property 6: Threads cannot be deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        async (name, location, whatsappNumber) => {
          // Create a tuition centre and thread
          const centre = await prisma.tuitionCentre.create({
            data: {
              name,
              location,
              whatsappNumber
            }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          // Attempt to delete the tuition centre (which should fail due to onDelete: Restrict)
          let deleteError;
          try {
            await prisma.tuitionCentre.delete({
              where: { id: centre.id }
            });
          } catch (error) {
            deleteError = error;
          }

          // Deletion should fail
          expect(deleteError).toBeDefined();

          // Thread should still exist
          const threadStillExists = await prisma.discussionThread.findUnique({
            where: { id: thread.id }
          });

          expect(threadStillExists).toBeDefined();
          expect(threadStillExists.id).toBe(thread.id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 7: Hidden comments are excluded
   * For any discussion thread, retrieving comments should return only 
   * comments where isHidden is false
   * Validates: Requirements 3.1, 6.2
   */
  it('Property 7: Hidden comments are excluded', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
        async (name, location, whatsappNumber, email, password, commentBodies) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create comments, some hidden
          for (let i = 0; i < commentBodies.length; i++) {
            await discussionService.createComment({
              threadId: thread.id,
              authorId: user.id,
              body: commentBodies[i],
              isAnonymous: false,
              authorRole: 'PARENT'
            });
          }

          // Hide some comments randomly
          const allComments = await prisma.comment.findMany({
            where: { discussionThreadId: thread.id }
          });

          const hiddenCount = Math.floor(allComments.length / 2);
          for (let i = 0; i < hiddenCount; i++) {
            await discussionService.hideComment(allComments[i].id, true);
          }

          // Get comments (should exclude hidden)
          const visibleComments = await discussionService.getComments(thread.id);

          // All returned comments should have isHidden = false
          visibleComments.forEach(comment => {
            expect(comment.isHidden).toBe(false);
          });

          // Count should match non-hidden comments
          expect(visibleComments.length).toBe(allComments.length - hiddenCount);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 8: Comments are chronologically ordered
   * For any discussion thread with multiple comments, the returned comments 
   * should be ordered by createdAt timestamp from oldest to newest
   * Validates: Requirements 3.2
   */
  it('Property 8: Comments are chronologically ordered', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 2, maxLength: 10 }),
        async (name, location, whatsappNumber, email, commentBodies) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create comments with slight delays to ensure different timestamps
          for (const body of commentBodies) {
            await discussionService.createComment({
              threadId: thread.id,
              authorId: user.id,
              body,
              isAnonymous: false,
              authorRole: 'PARENT'
            });
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          // Get comments
          const comments = await discussionService.getComments(thread.id);

          // Verify chronological order (oldest to newest)
          for (let i = 1; i < comments.length; i++) {
            const prevTime = new Date(comments[i - 1].createdAt).getTime();
            const currTime = new Date(comments[i].createdAt).getTime();
            expect(currTime).toBeGreaterThanOrEqual(prevTime);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 9: Anonymous comments hide author identity
   * For any comment where isAnonymous is true, the public API response 
   * should not expose the author's identity (author field should be null)
   * Validates: Requirements 3.3, 8.2
   */
  it('Property 9: Anonymous comments hide author identity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create anonymous comment
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: true,
            authorRole: 'PARENT'
          });

          // Comment returned from createComment should hide author
          expect(comment.author).toBeNull();

          // Get comments from thread
          const comments = await discussionService.getComments(thread.id);

          // Find the anonymous comment
          const anonymousComment = comments.find(c => c.id === comment.id);
          expect(anonymousComment).toBeDefined();
          expect(anonymousComment.author).toBeNull();

          // Verify the authorId is still stored in database
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });
          expect(dbComment.authorId).toBe(user.id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 10: Valid comments are stored
   * For any authenticated parent with valid comment text, creating a comment 
   * should result in the comment being stored in the database with all required fields
   * Validates: Requirements 4.1, 4.4
   */
  it('Property 10: Valid comments are stored', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        async (name, location, whatsappNumber, email, body, isAnonymous) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create comment
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous,
            authorRole: 'PARENT'
          });

          // Verify comment is stored with all required fields
          expect(comment).toBeDefined();
          expect(comment.id).toBeDefined();
          expect(comment.discussionThreadId).toBe(thread.id);
          expect(comment.body).toBeDefined();
          expect(comment.isAnonymous).toBe(isAnonymous);
          expect(comment.createdAt).toBeDefined();

          // Verify in database
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(dbComment).toBeDefined();
          expect(dbComment.authorId).toBe(user.id);
          expect(dbComment.body).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 11: Anonymity preference is respected
   * For any parent creating a comment, the isAnonymous flag should be 
   * stored exactly as specified in the request
   * Validates: Requirements 4.2
   */
  it('Property 11: Anonymity preference is respected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.boolean(),
        async (name, location, whatsappNumber, email, body, isAnonymous) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create comment with specific anonymity preference
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous,
            authorRole: 'PARENT'
          });

          // Verify anonymity preference is stored correctly
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(dbComment.isAnonymous).toBe(isAnonymous);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 12: Whitespace-only comments are rejected
   * For any string composed entirely of whitespace characters (spaces, tabs, newlines), 
   * attempting to create a comment with that body should be rejected
   * Validates: Requirements 4.3
   */
  it('Property 12: Whitespace-only comments are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/\S/g, ' ')),
        async (name, location, whatsappNumber, email, whitespaceBody) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Attempt to create comment with whitespace-only body
          let error;
          try {
            await discussionService.createComment({
              threadId: thread.id,
              authorId: user.id,
              body: whitespaceBody,
              isAnonymous: false,
              authorRole: 'PARENT'
            });
          } catch (err) {
            error = err;
          }

          // Should be rejected
          expect(error).toBeDefined();
          expect(error.code).toBe('INVALID_COMMENT_BODY');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 13: HTML and scripts are sanitized
   * For any comment body containing HTML tags or script elements, 
   * the stored comment should have those elements removed or escaped
   * Validates: Requirements 4.5
   */
  it('Property 13: HTML and scripts are sanitized', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0 && !s.includes('<') && !s.includes('>')),
        fc.constantFrom(
          '<script>alert("xss")</script>',
          '<img src=x onerror=alert(1)>',
          '<div onclick="alert(1)">Click me</div>',
          '<b>Bold text</b>',
          '<a href="javascript:alert(1)">Link</a>'
        ),
        async (name, location, whatsappNumber, safeText, maliciousCode) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          // Generate unique email for each test run
          const email = `user-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
          
          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create comment with malicious code
          const body = `${safeText} ${maliciousCode}`;
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: false,
            authorRole: 'PARENT'
          });

          // Verify HTML/script tags are removed
          expect(comment.body).not.toContain('<script');
          expect(comment.body).not.toContain('</script>');
          expect(comment.body).not.toContain('<img');
          expect(comment.body).not.toContain('<div');
          expect(comment.body).not.toContain('<b>');
          expect(comment.body).not.toContain('<a');
          expect(comment.body).not.toContain('onerror');
          expect(comment.body).not.toContain('onclick');

          // Verify safe text is preserved (since it doesn't contain < or >)
          expect(comment.body.trim()).toContain(safeText.trim());
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 14: Centre comments store correct role
   * For any authenticated centre account creating a comment, the stored comment 
   * should be associated with a user whose role is CENTRE
   * Validates: Requirements 5.1, 5.3
   */
  it('Property 14: Centre comments store correct role', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, and centre user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const centreUser = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'CENTRE'
            }
          });

          // Create comment as centre
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: centreUser.id,
            body,
            isAnonymous: false,
            authorRole: 'CENTRE'
          });

          // Verify comment is associated with CENTRE role user
          expect(comment.author).toBeDefined();
          expect(comment.author.role).toBe('CENTRE');

          // Verify in database
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id },
            include: { author: true }
          });

          expect(dbComment.author.role).toBe('CENTRE');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 15: Centres cannot post anonymously
   * For any centre account attempting to create a comment with isAnonymous 
   * set to true, the request should be rejected
   * Validates: Requirements 5.2
   */
  it('Property 15: Centres cannot post anonymously', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, and centre user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const centreUser = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'CENTRE'
            }
          });

          // Attempt to create anonymous comment as centre
          let error;
          try {
            await discussionService.createComment({
              threadId: thread.id,
              authorId: centreUser.id,
              body,
              isAnonymous: true,
              authorRole: 'CENTRE'
            });
          } catch (err) {
            error = err;
          }

          // Should be rejected
          expect(error).toBeDefined();
          expect(error.code).toBe('FORBIDDEN_ANONYMOUS_CENTRE');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 16: Hiding sets flag
   * For any comment, when an admin marks it as hidden, the isHidden flag 
   * should be set to true
   * Validates: Requirements 6.1
   */
  it('Property 16: Hiding sets flag', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, user, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: false,
            authorRole: 'PARENT'
          });

          // Hide the comment
          const hiddenComment = await discussionService.hideComment(comment.id, true);

          // Verify isHidden is set to true
          expect(hiddenComment.isHidden).toBe(true);

          // Verify in database
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(dbComment.isHidden).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 17: Unhiding restores visibility
   * For any hidden comment, when an admin unhides it, the isHidden flag 
   * should be set to false and the comment should appear in subsequent queries
   * Validates: Requirements 6.3
   */
  it('Property 17: Unhiding restores visibility', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, user, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: false,
            authorRole: 'PARENT'
          });

          // Hide then unhide the comment
          await discussionService.hideComment(comment.id, true);
          const unhiddenComment = await discussionService.hideComment(comment.id, false);

          // Verify isHidden is set to false
          expect(unhiddenComment.isHidden).toBe(false);

          // Verify comment appears in queries
          const comments = await discussionService.getComments(thread.id);
          const foundComment = comments.find(c => c.id === comment.id);
          expect(foundComment).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 18: Hiding preserves data
   * For any comment, hiding it should not modify any fields except 
   * isHidden and updatedAt
   * Validates: Requirements 6.4
   */
  it('Property 18: Hiding preserves data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.boolean(),
        async (name, location, whatsappNumber, email, body, isAnonymous) => {
          // Create centre, thread, user, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous,
            authorRole: 'PARENT'
          });

          // Store original values
          const originalBody = comment.body;
          const originalAuthorId = comment.authorId || user.id;
          const originalIsAnonymous = comment.isAnonymous;
          const originalThreadId = comment.discussionThreadId;

          // Hide the comment
          await discussionService.hideComment(comment.id, true);

          // Verify other fields are preserved
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(dbComment.body).toBe(originalBody);
          expect(dbComment.authorId).toBe(originalAuthorId);
          expect(dbComment.isAnonymous).toBe(originalIsAnonymous);
          expect(dbComment.discussionThreadId).toBe(originalThreadId);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 19: Anonymous comments store author internally
   * For any anonymous comment, the authorId should be stored in the database 
   * but not exposed in public API responses
   * Validates: Requirements 8.1
   */
  it('Property 19: Anonymous comments store author internally', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create anonymous comment
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: true,
            authorRole: 'PARENT'
          });

          // Public API should not expose author
          expect(comment.author).toBeNull();

          // Database should store authorId
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(dbComment.authorId).toBe(user.id);
          expect(dbComment.authorId).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 20: Admins can see anonymous authors
   * For any anonymous comment, when retrieved through an admin endpoint, 
   * the true author information should be included
   * Validates: Requirements 8.3
   */
  it('Property 20: Admins can see anonymous authors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create anonymous comment
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: true,
            authorRole: 'PARENT'
          });

          // Admin view (includeHidden = true) should show author
          const adminComments = await discussionService.getComments(thread.id, true);
          const adminComment = adminComments.find(c => c.id === comment.id);

          expect(adminComment).toBeDefined();
          expect(adminComment.author).toBeDefined();
          expect(adminComment.author.id).toBe(user.id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 21: Anonymous comments maintain referential integrity
   * For any anonymous comment, the authorId foreign key relationship 
   * should be maintained in the database
   * Validates: Requirements 8.4
   */
  it('Property 21: Anonymous comments maintain referential integrity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, and user
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          // Create anonymous comment
          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: true,
            authorRole: 'PARENT'
          });

          // Verify foreign key relationship
          const dbComment = await prisma.comment.findUnique({
            where: { id: comment.id },
            include: { author: true }
          });

          expect(dbComment.author).toBeDefined();
          expect(dbComment.author.id).toBe(user.id);
          expect(dbComment.authorId).toBe(user.id);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 22: Centre deletion preserves discussions
   * For any tuition centre with a discussion thread and comments, deleting 
   * the centre should fail due to the onDelete: Restrict constraint, 
   * preserving all discussion data
   * Validates: Requirements 9.1
   */
  it('Property 22: Centre deletion preserves discussions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, user, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: false,
            authorRole: 'PARENT'
          });

          // Attempt to delete centre
          let error;
          try {
            await prisma.tuitionCentre.delete({
              where: { id: centre.id }
            });
          } catch (err) {
            error = err;
          }

          // Deletion should fail
          expect(error).toBeDefined();

          // Thread and comment should still exist
          const threadExists = await prisma.discussionThread.findUnique({
            where: { id: thread.id }
          });
          const commentExists = await prisma.comment.findUnique({
            where: { id: comment.id }
          });

          expect(threadExists).toBeDefined();
          expect(commentExists).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 23: User deletion preserves comments
   * For any user with comments, deleting the user should set the authorId 
   * to null on all their comments while preserving the comment data
   * Validates: Requirements 9.2
   */
  it('Property 23: User deletion preserves comments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 15 }),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (name, location, whatsappNumber, email, body) => {
          // Create centre, thread, user, and comment
          const centre = await prisma.tuitionCentre.create({
            data: { name, location, whatsappNumber }
          });

          const thread = await discussionService.getOrCreateThread(centre.id);

          const user = await prisma.user.create({
            data: {
              email,
              passwordHash: 'hashed',
              role: 'PARENT'
            }
          });

          const comment = await discussionService.createComment({
            threadId: thread.id,
            authorId: user.id,
            body,
            isAnonymous: false,
            authorRole: 'PARENT'
          });

          const originalBody = comment.body;
          const commentId = comment.id;

          // Delete user
          await prisma.user.delete({
            where: { id: user.id }
          });

          // Comment should still exist with null authorId
          const dbComment = await prisma.comment.findUnique({
            where: { id: commentId }
          });

          expect(dbComment).toBeDefined();
          expect(dbComment.body).toBe(originalBody);
          expect(dbComment.authorId).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
