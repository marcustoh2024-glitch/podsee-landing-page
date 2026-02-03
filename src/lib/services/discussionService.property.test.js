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
        fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
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

          // Verify safe text is preserved (trimmed)
          expect(comment.body.trim()).toContain(safeText.trim());
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
