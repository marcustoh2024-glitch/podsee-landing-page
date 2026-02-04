import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/username
 * Set username for authenticated user (NextAuth version)
 * 
 * Request Body:
 * - username: Desired username (3-20 chars, alphanumeric + underscore)
 * 
 * Response:
 * - user: Updated user object
 */
export async function POST(request) {
  try {
    // Require authentication
    const session = await requireAuth();
    const userEmail = session.user.email;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        },
        { status: 404 }
      );
    }

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

    const { username } = body;

    // Validate username is provided
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_USERNAME',
            message: 'Username is required'
          }
        },
        { status: 400 }
      );
    }

    // Validate username format
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_USERNAME_LENGTH',
            message: 'Username must be between 3 and 20 characters'
          }
        },
        { status: 400 }
      );
    }

    // Only allow alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_USERNAME_FORMAT',
            message: 'Username can only contain letters, numbers, and underscores'
          }
        },
        { status: 400 }
      );
    }

    // Check if user already has a username
    if (user.username) {
      return NextResponse.json(
        {
          error: {
            code: 'USERNAME_ALREADY_SET',
            message: 'Username has already been set and cannot be changed'
          }
        },
        { status: 400 }
      );
    }

    // Check if username is already taken (case-insensitive for SQLite)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: trimmedUsername
      }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USERNAME_TAKEN',
            message: 'This username is already taken'
          }
        },
        { status: 409 }
      );
    }

    // Update user with username
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { username: trimmedUsername }
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      {
        user: userWithoutPassword
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle auth errors
    if (error.status === 401) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: error.message
          }
        },
        { status: 401 }
      );
    }

    // Log error with context
    console.error('Error in POST /api/auth/username:', {
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
              code: 'USERNAME_TAKEN',
              message: 'This username is already taken'
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
