import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/signup
 * Create a new user account
 * 
 * Request Body:
 * - email: User email address (required)
 * - password: User password (required, min 6 chars)
 * - role: User role (PARENT, CENTRE) - defaults to PARENT
 * 
 * Response:
 * - user: Created user object (without password hash)
 */
export async function POST(request) {
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

    const { email, password, role = 'PARENT' } = body;

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please enter a valid email address'
          }
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Password must be at least 6 characters'
          }
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['PARENT', 'CENTRE', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ROLE',
            message: 'Role must be PARENT, CENTRE, or ADMIN'
          }
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email already exists'
          }
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role
      }
    });

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: userWithoutPassword
      },
      { status: 201 }
    );

  } catch (error) {
    // Log error with context
    console.error('Error in POST /api/auth/signup:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Check if it's a database error
    if (error.code && error.code.startsWith('P')) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'An account with this email already exists'
            }
          },
          { status: 409 }
        );
      }

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
