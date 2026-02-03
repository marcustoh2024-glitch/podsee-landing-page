import { NextResponse } from 'next/server';
import DiscussionService from '@/lib/services/discussionService';
import AuthService from '@/lib/services/authService';

/**
 * PATCH /api/discussions/[centreId]/[commentId]
 * Hide or unhide a comment (admin-only)
 * 
 * Path Parameters:
 * - centreId: Tuition centre UUID
 * - commentId: Comment UUID
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Request Body:
 * - isHidden: Boolean flag to hide/unhide comment
 * 
 * Response:
 * - comment: Updated comment object
 */
export async function PATCH(request, { params }) {
  try {
    const { centreId, commentId } = params;

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

    // Validate comment ID format
    if (!commentId || !uuidRegex.test(commentId)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID_FORMAT',
            message: 'Comment ID must be a valid UUID',
            details: { commentId }
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

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Only administrators can hide or unhide comments'
          }
        },
        { status: 403 }
      );
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

    const { isHidden } = requestBody;

    // Validate isHidden field
    if (typeof isHidden !== 'boolean') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FIELD_TYPE',
            message: 'isHidden must be a boolean'
          }
        },
        { status: 400 }
      );
    }

    const discussionService = new DiscussionService();

    // Hide or unhide the comment
    let comment;
    try {
      comment = await discussionService.hideComment(commentId, isHidden);
    } catch (error) {
      if (error.code === 'COMMENT_NOT_FOUND') {
        return NextResponse.json(
          {
            error: {
              code: 'COMMENT_NOT_FOUND',
              message: 'Comment not found',
              details: { commentId }
            }
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // Return updated comment
    return NextResponse.json(
      {
        comment
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error with context
    console.error('Error in PATCH /api/discussions/[centreId]/[commentId]:', {
      message: error.message,
      stack: error.stack,
      centreId: params?.centreId,
      commentId: params?.commentId
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
