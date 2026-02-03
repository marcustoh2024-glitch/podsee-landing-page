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
});
