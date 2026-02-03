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
