import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import DiscussionService from './discussionService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const discussionService = new DiscussionService(prisma);

describe('DiscussionService Unit Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tuitionCentreSubject.deleteMany();
    await prisma.tuitionCentreLevel.deleteMany();
    await prisma.tuitionCentre.deleteMany();
  });

  describe('getOrCreateThread', () => {
    it('should create a new thread if one does not exist', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      expect(thread).toBeDefined();
      expect(thread.tuitionCentreId).toBe(centre.id);
      expect(thread.id).toBeDefined();
    });

    it('should return existing thread if one already exists', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread1 = await discussionService.getOrCreateThread(centre.id);
      const thread2 = await discussionService.getOrCreateThread(centre.id);

      expect(thread1.id).toBe(thread2.id);
    });

    it('should throw error for invalid centre ID', async () => {
      await expect(
        discussionService.getOrCreateThread('invalid-id')
      ).rejects.toThrow('Tuition centre not found');
    });

    it('should throw error for missing centre ID', async () => {
      await expect(
        discussionService.getOrCreateThread(null)
      ).rejects.toThrow('Centre ID is required');
    });
  });

  describe('getComments', () => {
    it('should return empty array for thread with no comments', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);
      const comments = await discussionService.getComments(thread.id);

      expect(comments).toEqual([]);
    });

    it('should return single comment', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Test comment',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      const comments = await discussionService.getComments(thread.id);

      expect(comments.length).toBe(1);
      expect(comments[0].body).toBe('Test comment');
    });

    it('should return many comments in chronological order', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      // Create multiple comments
      for (let i = 1; i <= 5; i++) {
        await discussionService.createComment({
          threadId: thread.id,
          authorId: user.id,
          body: `Comment ${i}`,
          isAnonymous: false,
          authorRole: 'PARENT'
        });
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const comments = await discussionService.getComments(thread.id);

      expect(comments.length).toBe(5);
      // Verify chronological order
      for (let i = 1; i < comments.length; i++) {
        const prevTime = new Date(comments[i - 1].createdAt).getTime();
        const currTime = new Date(comments[i].createdAt).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it('should throw error for invalid thread ID', async () => {
      await expect(
        discussionService.getComments(null)
      ).rejects.toThrow('Thread ID is required');
    });
  });

  describe('createComment', () => {
    it('should reject empty comment body', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      await expect(
        discussionService.createComment({
          threadId: thread.id,
          authorId: user.id,
          body: '',
          isAnonymous: false,
          authorRole: 'PARENT'
        })
      ).rejects.toThrow('Comment body cannot be empty');
    });

    it('should reject whitespace-only comment body', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      await expect(
        discussionService.createComment({
          threadId: thread.id,
          authorId: user.id,
          body: '   \n\t  ',
          isAnonymous: false,
          authorRole: 'PARENT'
        })
      ).rejects.toThrow('Comment body cannot be empty');
    });

    it('should sanitize XSS script tags', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      const comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Hello <script>alert("xss")</script> world',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      expect(comment.body).not.toContain('<script');
      expect(comment.body).not.toContain('</script>');
      expect(comment.body).toContain('Hello');
      expect(comment.body).toContain('world');
    });

    it('should sanitize HTML img tags with onerror', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      const comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Check this <img src=x onerror=alert(1)> image',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      expect(comment.body).not.toContain('<img');
      expect(comment.body).not.toContain('onerror');
    });

    it('should sanitize HTML anchor tags', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      const comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Click <a href="javascript:alert(1)">here</a>',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      expect(comment.body).not.toContain('<a');
      expect(comment.body).not.toContain('</a>');
      expect(comment.body).not.toContain('javascript:');
    });

    it('should throw error for missing required fields', async () => {
      await expect(
        discussionService.createComment({
          threadId: 'thread-id',
          authorId: null,
          body: 'Test',
          isAnonymous: false,
          authorRole: 'PARENT'
        })
      ).rejects.toThrow('Thread ID, author ID, and body are required');
    });

    it('should throw error for non-existent thread', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      await expect(
        discussionService.createComment({
          threadId: 'non-existent-thread',
          authorId: user.id,
          body: 'Test comment',
          isAnonymous: false,
          authorRole: 'PARENT'
        })
      ).rejects.toThrow('Discussion thread not found');
    });
  });

  describe('hideComment', () => {
    it('should hide a comment', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      const comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Test comment',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      const hiddenComment = await discussionService.hideComment(comment.id, true);

      expect(hiddenComment.isHidden).toBe(true);
    });

    it('should unhide a comment', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      const comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Test comment',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      await discussionService.hideComment(comment.id, true);
      const unhiddenComment = await discussionService.hideComment(comment.id, false);

      expect(unhiddenComment.isHidden).toBe(false);
    });

    it('should throw error for invalid comment ID', async () => {
      await expect(
        discussionService.hideComment('invalid-id', true)
      ).rejects.toThrow('Comment not found');
    });

    it('should throw error for missing comment ID', async () => {
      await expect(
        discussionService.hideComment(null, true)
      ).rejects.toThrow('Comment ID is required');
    });

    it('should throw error for invalid isHidden type', async () => {
      const centre = await prisma.tuitionCentre.create({
        data: {
          name: 'Test Centre',
          location: 'Test Location',
          whatsappNumber: '12345678'
        }
      });

      const thread = await discussionService.getOrCreateThread(centre.id);

      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: 'PARENT'
        }
      });

      const comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body: 'Test comment',
        isAnonymous: false,
        authorRole: 'PARENT'
      });

      await expect(
        discussionService.hideComment(comment.id, 'not-a-boolean')
      ).rejects.toThrow('isHidden must be a boolean');
    });
  });
});
