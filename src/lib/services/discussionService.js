import { prisma } from '../prisma.js';

/**
 * Service class for discussion thread and comment management
 * Handles business logic for creating threads, managing comments, and moderation
 */
class DiscussionService {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  /**
   * Get or create discussion thread for a tuition centre
   * Ensures exactly one thread per centre
   * @param {string} centreId - Tuition centre UUID
   * @returns {Promise<Object>} Discussion thread
   */
  async getOrCreateThread(centreId) {
    if (!centreId || typeof centreId !== 'string') {
      const error = new Error('Centre ID is required and must be a string');
      error.code = 'INVALID_ID_FORMAT';
      throw error;
    }

    // Validate that the centre exists
    const centre = await this.prisma.tuitionCentre.findUnique({
      where: { id: centreId }
    });

    if (!centre) {
      const error = new Error('Tuition centre not found');
      error.code = 'CENTRE_NOT_FOUND';
      throw error;
    }

    // Try to find existing thread
    let thread = await this.prisma.discussionThread.findUnique({
      where: { tuitionCentreId: centreId },
      include: {
        tuitionCentre: true
      }
    });

    // Create thread if it doesn't exist
    if (!thread) {
      thread = await this.prisma.discussionThread.create({
        data: {
          tuitionCentreId: centreId
        },
        include: {
          tuitionCentre: true
        }
      });
    }

    return thread;
  }

  /**
   * Get all non-hidden comments for a discussion thread
   * Returns comments ordered chronologically (oldest to newest)
   * @param {string} threadId - Discussion thread UUID
   * @param {boolean} includeHidden - Include hidden comments (admin only)
   * @returns {Promise<Array>} Array of comments
   */
  async getComments(threadId, includeHidden = false) {
    if (!threadId || typeof threadId !== 'string') {
      const error = new Error('Thread ID is required and must be a string');
      error.code = 'INVALID_ID_FORMAT';
      throw error;
    }

    // Build where clause
    const where = {
      discussionThreadId: threadId
    };

    // Exclude hidden comments unless explicitly requested
    if (!includeHidden) {
      where.isHidden = false;
    }

    const comments = await this.prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format comments to hide author identity for anonymous comments
    return comments.map(comment => {
      if (comment.isAnonymous && !includeHidden) {
        // Hide author for anonymous comments in public API
        return {
          ...comment,
          author: null
        };
      }
      return comment;
    });
  }

  /**
   * Create a new comment with validation and sanitization
   * @param {Object} data - Comment data
   * @param {string} data.threadId - Discussion thread UUID
   * @param {string} data.authorId - User UUID
   * @param {string} data.body - Comment text
   * @param {boolean} data.isAnonymous - Anonymous flag
   * @param {string} data.authorRole - User role (PARENT, CENTRE, ADMIN)
   * @returns {Promise<Object>} Created comment
   */
  async createComment(data) {
    const { threadId, authorId, body, isAnonymous = false, authorRole } = data;

    // Validate required fields
    if (!threadId || !authorId || !body) {
      const error = new Error('Thread ID, author ID, and body are required');
      error.code = 'MISSING_FIELDS';
      throw error;
    }

    // Validate body is not empty or whitespace-only
    if (!body.trim()) {
      const error = new Error('Comment body cannot be empty or whitespace-only');
      error.code = 'INVALID_COMMENT_BODY';
      throw error;
    }

    // Validate that centre accounts cannot post anonymously
    if (authorRole === 'CENTRE' && isAnonymous) {
      const error = new Error('Centre accounts cannot post anonymously');
      error.code = 'FORBIDDEN_ANONYMOUS_CENTRE';
      throw error;
    }

    // Sanitize body to prevent XSS
    const sanitizedBody = this.sanitizeHtml(body);

    // Verify thread exists
    const thread = await this.prisma.discussionThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      const error = new Error('Discussion thread not found');
      error.code = 'THREAD_NOT_FOUND';
      throw error;
    }

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        discussionThreadId: threadId,
        authorId,
        body: sanitizedBody,
        isAnonymous
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Hide author identity for anonymous comments in response
    if (comment.isAnonymous) {
      return {
        ...comment,
        author: null
      };
    }

    return comment;
  }

  /**
   * Hide or unhide a comment (moderation)
   * @param {string} commentId - Comment UUID
   * @param {boolean} isHidden - Hidden flag
   * @returns {Promise<Object>} Updated comment
   */
  async hideComment(commentId, isHidden) {
    if (!commentId || typeof commentId !== 'string') {
      const error = new Error('Comment ID is required and must be a string');
      error.code = 'INVALID_ID_FORMAT';
      throw error;
    }

    if (typeof isHidden !== 'boolean') {
      const error = new Error('isHidden must be a boolean');
      error.code = 'INVALID_FIELD_TYPE';
      throw error;
    }

    // Verify comment exists
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      const error = new Error('Comment not found');
      error.code = 'COMMENT_NOT_FOUND';
      throw error;
    }

    // Update only the isHidden flag
    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        isHidden
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    return comment;
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   * Removes all HTML tags and script content
   * @param {string} html - HTML string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeHtml(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Remove all HTML tags and script content
    // This is a simple implementation - for production, consider using a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]+>/g, '') // Remove all HTML tags
      .trim();
  }
}

export default DiscussionService;
