import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/login', () => {
  let mockAuthService;

  beforeEach(() => {
    // Create a fresh mock service for each test
    mockAuthService = {
      authenticate: vi.fn()
    };
  });

  describe('Successful Login', () => {
    it('should return 200 with user data and token for valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'parent@example.com',
        role: 'PARENT',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const mockToken = 'jwt-token-abc123';

      mockAuthService.authenticate.mockResolvedValue({
        user: mockUser,
        token: mockToken
      });

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'parent@example.com',
          password: 'password123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual(mockUser);
      expect(data.token).toBe(mockToken);
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        'parent@example.com',
        'password123',
        undefined
      );
    });

    it('should pass role parameter to authenticate when provided', async () => {
      const mockUser = {
        id: 'centre-123',
        email: 'centre@example.com',
        role: 'CENTRE',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const mockToken = 'jwt-token-xyz789';

      mockAuthService.authenticate.mockResolvedValue({
        user: mockUser,
        token: mockToken
      });

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'centre@example.com',
          password: 'centrepass123',
          role: 'CENTRE'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.role).toBe('CENTRE');
      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        'centre@example.com',
        'centrepass123',
        'CENTRE'
      );
    });

    it('should return user without password hash', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'test@example.com',
        role: 'PARENT',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAuthService.authenticate.mockResolvedValue({
        user: mockUser,
        token: 'token-123'
      });

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(data.user).not.toHaveProperty('passwordHash');
      expect(data.user).not.toHaveProperty('password');
    });
  });

  describe('Invalid Credentials Error', () => {
    it('should return 401 for invalid password', async () => {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      mockAuthService.authenticate.mockRejectedValue(error);

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'wrongpassword'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('INVALID_CREDENTIALS');
      expect(data.error.message).toBe('Invalid email or password');
    });

    it('should not reveal whether email exists in error message', async () => {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      mockAuthService.authenticate.mockRejectedValue(error);

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe('Invalid email or password');
      expect(data.error.message).not.toContain('email');
      expect(data.error.message).not.toContain('user');
    });
  });

  describe('Missing Fields Error', () => {
    it('should return 400 when email is missing', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_FIELDS');
      expect(data.error.message).toContain('Email and password are required');
      expect(data.error.details.missingFields).toContain('email');
    });

    it('should return 400 when password is missing', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_FIELDS');
      expect(data.error.message).toContain('Email and password are required');
      expect(data.error.details.missingFields).toContain('password');
    });

    it('should return 400 when both email and password are missing', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_FIELDS');
      expect(data.error.details.missingFields).toContain('email');
      expect(data.error.details.missingFields).toContain('password');
    });

    it('should return 400 when email is empty string', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          password: 'password123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_FIELDS');
      expect(data.error.details.missingFields).toContain('email');
    });

    it('should return 400 when password is empty string', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: ''
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('MISSING_FIELDS');
      expect(data.error.details.missingFields).toContain('password');
    });
  });

  describe('Malformed Request Body', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {'
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_JSON');
      expect(data.error.message).toBe('Request body must be valid JSON');
    });

    it('should return 400 for non-JSON content', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'email=test@example.com&password=pass123'
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_JSON');
    });

    it('should return 400 for empty request body', async () => {
      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ''
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_JSON');
    });
  });

  describe('Validation Errors from AuthService', () => {
    it('should return 400 for invalid email format', async () => {
      const error = new Error('Invalid email format');
      error.code = 'INVALID_EMAIL';
      mockAuthService.authenticate.mockRejectedValue(error);

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'password123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_EMAIL');
      expect(data.error.message).toBe('Invalid email format');
    });

    it('should return 400 for invalid password', async () => {
      const error = new Error('Password must be at least 8 characters');
      error.code = 'INVALID_PASSWORD';
      mockAuthService.authenticate.mockRejectedValue(error);

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'short'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_PASSWORD');
    });
  });

  describe('Server Error Handling', () => {
    it('should return 500 for database errors', async () => {
      const dbError = new Error('Database connection failed');
      dbError.code = 'P1001'; // Prisma error code
      mockAuthService.authenticate.mockRejectedValue(dbError);

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('DATABASE_ERROR');
      expect(data.error.message).toContain('database error');
    });

    it('should return 500 for unexpected errors', async () => {
      mockAuthService.authenticate.mockRejectedValue(new Error('Unexpected error'));

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123'
        })
      });

      const response = await POST(request, { authService: mockAuthService });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(data.error.message).toContain('unexpected error');
    });
  });
});
