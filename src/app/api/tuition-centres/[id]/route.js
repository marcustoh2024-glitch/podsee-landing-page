import { NextResponse } from 'next/server';
import TuitionCentreService from '@/lib/services/tuitionCentreService';

/**
 * GET /api/tuition-centres/:id
 * Get tuition centre by ID
 * 
 * Path Parameters:
 * - id: Tuition centre UUID
 */
export async function GET(request, { params, tuitionCentreService = new TuitionCentreService() } = {}) {
  try {
    // Extract ID from params
    const { id } = params;

    // Validate ID parameter format (basic UUID validation)
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Tuition centre ID is required and must be a valid string',
            details: { id }
          }
        },
        { status: 400 }
      );
    }

    // Basic UUID format validation (8-4-4-4-12 hex characters)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id.trim())) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID_FORMAT',
            message: 'Tuition centre ID must be a valid UUID format',
            details: { id }
          }
        },
        { status: 400 }
      );
    }

    // Call service layer to get tuition centre by ID
    const centre = await tuitionCentreService.getTuitionCentreById(id.trim());

    // Return formatted response with all centre details
    return NextResponse.json(centre, { status: 200 });

  } catch (error) {
    // Log error with context
    console.error('Error in GET /api/tuition-centres/:id:', {
      message: error.message,
      stack: error.stack,
      url: request.url,
      id: params?.id
    });

    // Handle not found error (404)
    if (error.statusCode === 404 || error.message === 'Tuition centre not found') {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Tuition centre not found',
            details: { id: params?.id }
          }
        },
        { status: 404 }
      );
    }

    // Check if it's a database error
    if (error.code && error.code.startsWith('P')) {
      // Prisma error codes start with 'P'
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

    // Generic server error (500)
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
