import { NextResponse } from 'next/server';
import AuthService from '@/lib/services/authService';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * 
 * Request Body:
 * - email: User email address
 * - password: User password
 * - role: Optional user role (PARENT, CENTRE, ADMIN) - defaults to PARENT
 * 
 * Response:
 * - user: User object (without password hash)
 * - token: JWT session token
 */
export async function POST(request, { authService = new AuthService() } = {}) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON'
          }
        },
        { status: 400 }
      );
    }

    const { email, password, role } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email and password are required',
            details: {
              missingFields: [
                !email && 'email',
                !password && 'password'
              ].filter(Boolean)
            }
          }
        },
        { status: 400 }
      );
    }

    // Call AuthService to authenticate
    const result = await authService.authenticate(email, password, role);

    // Return user data and token
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // Log error with context
    console.error('Error in POST /api/auth/login:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Handle specific authentication errors
    if (error.code === 'MISSING_CREDENTIALS') {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_CREDENTIALS',
            message: error.message
          }
        },
        { status: 400 }
      );
    }

    if (error.code === 'INVALID_EMAIL') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_EMAIL',
            message: error.message
          }
        },
        { status: 400 }
      );
    }

    if (error.code === 'INVALID_PASSWORD') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PASSWORD',
            message: error.message
          }
        },
        { status: 400 }
      );
    }

    if (error.code === 'INVALID_CREDENTIALS') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        },
        { status: 401 }
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
