import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route.js';
import { NextResponse } from 'next/server';

/**
 * Unit tests for GET /api/auth/validate endpoint
 * 
 * Tests cover:
 * - Successful token validation
 * - Missing authorization header
 * - Invalid token format
 * - Expired token
 * - Invalid token
 * - User not found
 * - Server errors
 */

describe('GET /api/auth/validate', () => {
  let mockAuthService;
  let mockRequest;

  beforeEach(() => {
    // Mock AuthService
    mockAuthService = {
      validateSession: vi.fn()
    };

    // Mock Request object
    mockRequest = {
      headers: {
        get: vi.fn()
      }
    };
  });

  it('should return user data for valid token', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'parent@example.com',
      role: 'PARENT',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRequest.headers.get.mockReturnValue('Bearer valid-token-123');
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual(mockUser);
    expect(mockAuthService.validateSession).toHaveBeenCalledWith('valid-token-123');
  });

  it('should return 401 when authorization header is missing', async () => {
    mockRequest.headers.get.mockReturnValue(null);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('MISSING_TOKEN');
    expect(data.error.message).toBe('Authorization header with Bearer token is required');
    expect(mockAuthService.validateSession).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', async () => {
    mockRequest.headers.get.mockReturnValue('Basic some-token');

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('MISSING_TOKEN');
    expect(data.error.message).toBe('Authorization header with Bearer token is required');
    expect(mockAuthService.validateSession).not.toHaveBeenCalled();
  });

  it('should return 401 for expired token', async () => {
    mockRequest.headers.get.mockReturnValue('Bearer expired-token');

    const error = new Error('Token expired');
    error.code = 'TOKEN_EXPIRED';
    mockAuthService.validateSession.mockRejectedValue(error);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('TOKEN_EXPIRED');
    expect(data.error.message).toBe('Session has expired, please login again');
  });

  it('should return 401 for invalid token', async () => {
    mockRequest.headers.get.mockReturnValue('Bearer invalid-token');

    const error = new Error('Invalid token');
    error.code = 'INVALID_TOKEN';
    mockAuthService.validateSession.mockRejectedValue(error);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('INVALID_TOKEN');
    expect(data.error.message).toBe('Invalid session token');
  });

  it('should return 401 when user is not found', async () => {
    mockRequest.headers.get.mockReturnValue('Bearer valid-token-but-user-deleted');

    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    mockAuthService.validateSession.mockRejectedValue(error);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('USER_NOT_FOUND');
    expect(data.error.message).toBe('User account not found');
  });

  it('should return 401 when token is missing from service', async () => {
    mockRequest.headers.get.mockReturnValue('Bearer ');

    const error = new Error('Token is required');
    error.code = 'MISSING_TOKEN';
    mockAuthService.validateSession.mockRejectedValue(error);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('MISSING_TOKEN');
  });

  it('should return 500 for unexpected errors', async () => {
    mockRequest.headers.get.mockReturnValue('Bearer some-token');

    const error = new Error('Database connection failed');
    mockAuthService.validateSession.mockRejectedValue(error);

    const response = await GET(mockRequest, { authService: mockAuthService });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(data.error.message).toBe('An unexpected error occurred while validating your session');
  });

  it('should extract token correctly from Bearer header', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'parent@example.com',
      role: 'PARENT'
    };

    mockRequest.headers.get.mockReturnValue('Bearer my-jwt-token-here');
    mockAuthService.validateSession.mockResolvedValue(mockUser);

    await GET(mockRequest, { authService: mockAuthService });

    expect(mockAuthService.validateSession).toHaveBeenCalledWith('my-jwt-token-here');
  });
});
