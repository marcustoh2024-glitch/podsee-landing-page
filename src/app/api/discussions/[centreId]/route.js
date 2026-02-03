import { NextResponse } from 'next/server';
import DiscussionService from '@/lib/services/discussionService';
import AuthService from '@/lib/services/authService';

/**
 * GET /api/discussions/[centreId]
 * Retrieve discussion thread and comments for a tuition centre
 * Allows unauthenticated access
 * 
 * Path Parameters:
 * - centreId: Tuition centre UUID
 * 
 * Response:
 * - thread: Discussion thread with tuition centre details
 * - comments: Array of non-hidden comments ordered chronologically
 */
export async function GET(request, { params }) {
  try {
    const { centreId } = params;

    // Validate centre ID format (basic UUID validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!centreId || !uuidRegex.test(centreId)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID_FORMAT',
            message: 'Centre ID must be a valid UUID',
            details: { centreId }
          }
        },
        { status: 400 }
      );
    }

    const discussionService = new DiscussionService();

    // Get or create thread for the centre
    let thread;
    try {
      thread = await discussionService.getOrCreateThread(centreId);
    } catch (error) {
      if (error.code === 'CENTRE_NOT_FOUND') {
        return NextResponse.json(
          {
            error: {
              code: 'CENTRE_NOT_FOUND',
              message: 'Tuition centre not found',
              details: { centreId }
            }
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get comments for the thread
    const comments = await discussionService.getComments(thread.id);

    // Format response
    return NextResponse.json(
      {
        thread,
        comments
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error with context
    console.error('Error in GET /api/discussions/[centreId]:', {
      message: error.message,
      stack: error.stack,
      centreId: params?.centreId
    });

    // Check if it's a database error
    if (error.code && error.code.startsWith('P')) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'A database error occurred while processing your request'
          }
        },
        { status: 500 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while processing your request'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions/[centreId]
 * Create a new comment in the discussion thread
 * Requires authentication
 * 
 * Path Parameters:
 * - centreId: Tuition centre UUID
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * Request Body:
 * - body: Comment text (required, non-empty)
 * - isAnonymous: Boolean flag for anonymous posting (optional, default: false)
 * 
 * Response:
 * - comment: Created comment object
 */
export async function POST(request, { params }) {
  try {
    const { centreId } = params;

    // Validate centre ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!centreId || !uuidRegex.test(centreId)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID_FORMAT',
            message: 'Centre ID must be a valid UUID',
            details: { centreId }
          }
        },
        { status: 400 }
      );
    }

    // Extract and validate authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication token is required'
          }
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate session and get user
    const authService = new AuthService();
    let user;
    try {
      user = await authService.validateSession(token);
    } catch (error) {
      if (error.code === 'TOKEN_EXPIRED' || error.code === 'INVALID_TOKEN') {
        return NextResponse.json(
          {
            error: {
              code: error.code,
              message: error.message
            }
          },
          { status: 401 }
        );
      }
      throw error;
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST_BODY',
            message: 'Request body must be valid JSON'
          }
        },
        { status: 400 }
      );
    }

    const { body, isAnonymous = false } = requestBody;

    // Validate request body fields
    if (body === undefined || body === null) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_FIELDS',
            message: 'Comment body is required'
          }
        },
        { status: 400 }
      );
    }

    if (typeof isAnonymous !== 'boolean') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FIELD_TYPE',
            message: 'isAnonymous must be a boolean'
          }
        },
        { status: 400 }
      );
    }

    // Reject centre accounts posting anonymously
    if (user.role === 'CENTRE' && isAnonymous) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN_ANONYMOUS_CENTRE',
            message: 'Centre accounts cannot post anonymously'
          }
        },
        { status: 403 }
      );
    }

    const discussionService = new DiscussionService();

    // Get or create thread for the centre
    let thread;
    try {
      thread = await discussionService.getOrCreateThread(centreId);
    } catch (error) {
      if (error.code === 'CENTRE_NOT_FOUND') {
        return NextResponse.json(
          {
            error: {
              code: 'CENTRE_NOT_FOUND',
              message: 'Tuition centre not found',
              details: { centreId }
            }
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // Create comment
    let comment;
    try {
      comment = await discussionService.createComment({
        threadId: thread.id,
        authorId: user.id,
        body,
        isAnonymous,
        authorRole: user.role
      });
    } catch (error) {
      if (error.code === 'INVALID_COMMENT_BODY') {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_COMMENT_BODY',
              message: error.message
            }
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Return created comment
    return NextResponse.json(
      {
        comment
      },
      { status: 201 }
    );

  } catch (error) {
    // Log error with context
    console.error('Error in POST /api/discussions/[centreId]:', {
      message: error.message,
      stack: error.stack,
      centreId: params?.centreId
    });

    // Check if it's a database error
    if (error.code && error.code.startsWith('P')) {
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'A database error occurred while processing your request'
          }
        },
        { status: 500 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while processing your request'
        }
      },
      { status: 500 }
    );
  }
}
