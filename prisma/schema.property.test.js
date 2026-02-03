import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Feature: community-forum - Schema Constraints Property Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tuitionCentre.deleteMany();
  });

  // Feature: community-forum, Property 24: Invalid thread foreign keys are rejected
  // Validates: Requirements 9.3
  it('Property 24: Invalid thread foreign keys are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Generate random UUID for non-existent thread
        fc.string({ minLength: 1, maxLength: 500 }), // Comment body
        async (nonExistentThreadId, commentBody) => {
          // Create a user for the comment
          const user = await prisma.user.create({
            data: {
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              passwordHash: 'hashedpassword',
              role: 'PARENT'
            }
          });

          // Attempt to create a comment with a non-existent discussionThreadId
          await expect(
            prisma.comment.create({
              data: {
                discussionThreadId: nonExistentThreadId,
                authorId: user.id,
                body: commentBody,
                isAnonymous: false
              }
            })
          ).rejects.toThrow();

          // Clean up user
          await prisma.user.delete({ where: { id: user.id } });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: community-forum, Property 25: Invalid centre foreign keys are rejected
  // Validates: Requirements 9.4
  it('Property 25: Invalid centre foreign keys are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Generate random UUID for non-existent centre
        async (nonExistentCentreId) => {
          // Attempt to create a discussion thread with a non-existent tuitionCentreId
          await expect(
            prisma.discussionThread.create({
              data: {
                tuitionCentreId: nonExistentCentreId
              }
            })
          ).rejects.toThrow();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: Valid foreign keys are accepted
  it('Property 24 & 25 (valid case): Valid foreign keys are accepted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // Centre name
        fc.string({ minLength: 1, maxLength: 100 }), // Location
        fc.string({ minLength: 1, maxLength: 500 }), // Comment body
        async (centreName, location, commentBody) => {
          // Create a tuition centre
          const centre = await prisma.tuitionCentre.create({
            data: {
              name: centreName,
              location: location,
              whatsappNumber: '+6591234567'
            }
          });

          // Create a discussion thread with valid centre ID
          const thread = await prisma.discussionThread.create({
            data: {
              tuitionCentreId: centre.id
            }
          });

          // Verify thread was created
          expect(thread.id).toBeDefined();
          expect(thread.tuitionCentreId).toBe(centre.id);

          // Create a user
          const user = await prisma.user.create({
            data: {
              email: `test-${Date.now()}-${Math.random()}@example.com`,
              passwordHash: 'hashedpassword',
              role: 'PARENT'
            }
          });

          // Create a comment with valid thread ID
          const comment = await prisma.comment.create({
            data: {
              discussionThreadId: thread.id,
              authorId: user.id,
              body: commentBody,
              isAnonymous: false
            }
          });

          // Verify comment was created
          expect(comment.id).toBeDefined();
          expect(comment.discussionThreadId).toBe(thread.id);

          // Clean up
          await prisma.comment.delete({ where: { id: comment.id } });
          await prisma.discussionThread.delete({ where: { id: thread.id } });
          await prisma.user.delete({ where: { id: user.id } });
          await prisma.tuitionCentre.delete({ where: { id: centre.id } });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
