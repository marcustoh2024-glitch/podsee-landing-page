import { NextResponse } from 'next/server';
import AuthService from '@/lib/services/authService';

/**
 * GET /api/auth/validate
 * Validate session token and return user data
 * 
 * Headers:
 * - Authorization: Bearer <token>
 * 
 * Response:
 * - user: User object (without password hash)
 */
export async function GET(request, { authService = new AuthService() } = {}) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authorization header with Bearer token is required'
          }
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate token using AuthService
    const user = await authService.validateSession(token);

    // Return user data
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    // Log error with context
    console.error('Error in GET /api/auth/validate:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Handle specific validation errors
    if (error.code === 'MISSING_TOKEN') {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_TOKEN',
            message: error.message
          }
        },
        { status: 401 }
      );
    }

    if (error.code === 'TOKEN_EXPIRED') {
      return NextResponse.json(
        {
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Session has expired, please login again'
          }
        },
        { status: 401 }
      );
    }

    if (error.code === 'INVALID_TOKEN') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid session token'
          }
        },
        { status: 401 }
      );
    }

    if (error.code === 'USER_NOT_FOUND') {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found'
          }
        },
        { status: 401 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while validating your session'
        }
      },
      { status: 500 }
    );
  }
}
