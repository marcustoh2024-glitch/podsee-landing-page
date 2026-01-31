import { NextResponse } from 'next/server';
import TuitionCentreService from '@/lib/services/tuitionCentreService';

/**
 * GET /api/tuition-centres
 * Search and filter tuition centres
 * 
 * Query Parameters:
 * - search: Search term for name or location
 * - levels: Comma-separated level IDs or names
 * - subjects: Comma-separated subject IDs or names
 * - page: Page number (default: 1, min: 1)
 * - limit: Results per page (default: 20, max: 100)
 */
export async function GET(request, { tuitionCentreService = new TuitionCentreService() } = {}) {
  try {
    // Parse query parameters from URL
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || undefined;
    const levelsParam = searchParams.get('levels');
    const subjectsParam = searchParams.get('subjects');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Parse and validate page parameter
    let page = 1;
    if (pageParam) {
      page = parseInt(pageParam, 10);
      if (isNaN(page) || page < 1) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_PAGE',
              message: 'Page parameter must be a positive integer',
              details: { page: pageParam }
            }
          },
          { status: 400 }
        );
      }
    }

    // Parse and validate limit parameter
    let limit = 20;
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_LIMIT',
              message: 'Limit parameter must be a positive integer',
              details: { limit: limitParam }
            }
          },
          { status: 400 }
        );
      }
      if (limit > 100) {
        return NextResponse.json(
          {
            error: {
              code: 'LIMIT_EXCEEDED',
              message: 'Limit parameter cannot exceed 100',
              details: { limit, max: 100 }
            }
          },
          { status: 400 }
        );
      }
    }

    // Parse levels and subjects (comma-separated)
    const levels = levelsParam ? levelsParam.split(',').map(l => l.trim()).filter(Boolean) : undefined;
    const subjects = subjectsParam ? subjectsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    // Build filters object
    const filters = {
      search,
      levels,
      subjects,
      page,
      limit
    };

    // Call service layer
    const result = await tuitionCentreService.searchTuitionCentres(filters);

    // Return formatted response
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // Log error with context
    console.error('Error in GET /api/tuition-centres:', {
      message: error.message,
      stack: error.stack,
      url: request.url
    });

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
