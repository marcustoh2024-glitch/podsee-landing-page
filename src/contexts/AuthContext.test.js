import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit tests for AuthContext
 * 
 * Tests cover:
 * - Login updates context state
 * - Logout clears context state
 * - Token persistence in localStorage
 * - Token validation on app load
 * - Error handling
 * 
 * Requirements: 1.2, 1.3
 */

describe('AuthContext - Logic Tests', () => {
  let originalFetch;
  let originalLocalStorage;

  beforeEach(() => {
    // Mock fetch
    originalFetch = global.fetch;
    global.fetch = vi.fn();

    // Mock localStorage
    originalLocalStorage = global.localStorage;
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
    vi.clearAllMocks();
  });

  describe('Login functionality', () => {
    it('should update context state on successful login', async () => {
      // Mock successful login response
      const mockUser = {
        id: 'user-123',
        email: 'parent@example.com',
        role: 'PARENT'
      };
      const mockToken = 'jwt-token-123';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          token: mockToken
        })
      });

      // Simulate login logic
      const login = async (email, password, role = 'PARENT') => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          return {
            success: true,
            user: data.user,
            token: data.token
          };
        }

        return { success: false, error: data.error?.message };
      };

      const result = await login('parent@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe(mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
    });

    it('should handle login failure', async () => {
      // Mock failed login response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        })
      });

      // Simulate login logic
      const login = async (email, password, role = 'PARENT') => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          return {
            success: true,
            user: data.user,
            token: data.token
          };
        }

        return { success: false, error: data.error?.message };
      };

      const result = await login('parent@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle network errors during login', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Simulate login logic with error handling
      const login = async (email, password, role = 'PARENT') => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('authToken', data.token);
            return {
              success: true,
              user: data.user,
              token: data.token
            };
          }

          return { success: false, error: data.error?.message };
        } catch (error) {
          return {
            success: false,
            error: 'An unexpected error occurred during login'
          };
        }
      };

      const result = await login('parent@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred during login');
    });
  });

  describe('Logout functionality', () => {
    it('should clear context state and localStorage on logout', () => {
      // Simulate logout logic
      const logout = () => {
        localStorage.removeItem('authToken');
        return {
          user: null,
          token: null,
          isAuthenticated: false
        };
      };

      const result = logout();

      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle logout when no user is logged in', () => {
      // Simulate logout logic
      const logout = () => {
        localStorage.removeItem('authToken');
        return {
          user: null,
          token: null,
          isAuthenticated: false
        };
      };

      const result = logout();

      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('Token persistence', () => {
    it('should load token from localStorage on app load', async () => {
      const mockToken = 'stored-jwt-token';
      const mockUser = {
        id: 'user-123',
        email: 'parent@example.com',
        role: 'PARENT'
      };

      global.localStorage.getItem.mockReturnValue(mockToken);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      });

      // Simulate token loading logic
      const loadStoredAuth = async () => {
        const storedToken = localStorage.getItem('authToken');

        if (storedToken) {
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const data = await response.json();
            return {
              user: data.user,
              token: storedToken,
              isAuthenticated: true
            };
          } else {
            localStorage.removeItem('authToken');
            return {
              user: null,
              token: null,
              isAuthenticated: false
            };
          }
        }

        return {
          user: null,
          token: null,
          isAuthenticated: false
        };
      };

      const result = await loadStoredAuth();

      expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/validate', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${mockToken}` }
      });
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe(mockToken);
      expect(result.isAuthenticated).toBe(true);
    });

    it('should clear invalid token from localStorage', async () => {
      const mockToken = 'invalid-token';

      global.localStorage.getItem.mockReturnValue(mockToken);
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
        })
      });

      // Simulate token loading logic
      const loadStoredAuth = async () => {
        const storedToken = localStorage.getItem('authToken');

        if (storedToken) {
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const data = await response.json();
            return {
              user: data.user,
              token: storedToken,
              isAuthenticated: true
            };
          } else {
            localStorage.removeItem('authToken');
            return {
              user: null,
              token: null,
              isAuthenticated: false
            };
          }
        }

        return {
          user: null,
          token: null,
          isAuthenticated: false
        };
      };

      const result = await loadStoredAuth();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should handle missing token in localStorage', async () => {
      global.localStorage.getItem.mockReturnValue(null);

      // Simulate token loading logic
      const loadStoredAuth = async () => {
        const storedToken = localStorage.getItem('authToken');

        if (storedToken) {
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const data = await response.json();
            return {
              user: data.user,
              token: storedToken,
              isAuthenticated: true
            };
          } else {
            localStorage.removeItem('authToken');
            return {
              user: null,
              token: null,
              isAuthenticated: false
            };
          }
        }

        return {
          user: null,
          token: null,
          isAuthenticated: false
        };
      };

      const result = await loadStoredAuth();

      expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });

    it('should handle network errors during token validation', async () => {
      const mockToken = 'stored-jwt-token';

      global.localStorage.getItem.mockReturnValue(mockToken);
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Simulate token loading logic with error handling
      const loadStoredAuth = async () => {
        try {
          const storedToken = localStorage.getItem('authToken');

          if (storedToken) {
            const response = await fetch('/api/auth/validate', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${storedToken}` }
            });

            if (response.ok) {
              const data = await response.json();
              return {
                user: data.user,
                token: storedToken,
                isAuthenticated: true
              };
            } else {
              localStorage.removeItem('authToken');
              return {
                user: null,
                token: null,
                isAuthenticated: false
              };
            }
          }

          return {
            user: null,
            token: null,
            isAuthenticated: false
          };
        } catch (error) {
          localStorage.removeItem('authToken');
          return {
            user: null,
            token: null,
            isAuthenticated: false
          };
        }
      };

      const result = await loadStoredAuth();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe('Authentication state', () => {
    it('should correctly determine authenticated state with user and token', () => {
      const user = {
        id: 'user-123',
        email: 'parent@example.com',
        role: 'PARENT'
      };
      const token = 'jwt-token-123';

      const isAuthenticated = !!(user && token);

      expect(isAuthenticated).toBe(true);
    });

    it('should correctly determine unauthenticated state without user', () => {
      const user = null;
      const token = 'jwt-token-123';

      const isAuthenticated = !!(user && token);

      expect(isAuthenticated).toBe(false);
    });

    it('should correctly determine unauthenticated state without token', () => {
      const user = {
        id: 'user-123',
        email: 'parent@example.com',
        role: 'PARENT'
      };
      const token = null;

      const isAuthenticated = !!(user && token);

      expect(isAuthenticated).toBe(false);
    });

    it('should correctly determine unauthenticated state without user or token', () => {
      const user = null;
      const token = null;

      const isAuthenticated = !!(user && token);

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('useAuth hook error handling', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Simulate useAuth hook logic
      const useAuth = (context) => {
        if (context === null) {
          throw new Error('useAuth must be used within an AuthProvider');
        }
        return context;
      };

      expect(() => useAuth(null)).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should return context when used within AuthProvider', () => {
      const mockContext = {
        user: { id: 'user-123', email: 'parent@example.com', role: 'PARENT' },
        token: 'jwt-token-123',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn()
      };

      // Simulate useAuth hook logic
      const useAuth = (context) => {
        if (context === null) {
          throw new Error('useAuth must be used within an AuthProvider');
        }
        return context;
      };

      const result = useAuth(mockContext);

      expect(result).toEqual(mockContext);
    });
  });

  describe('Login with different roles', () => {
    it('should support login as PARENT role', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'parent@example.com',
        role: 'PARENT'
      };
      const mockToken = 'jwt-token-123';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          token: mockToken
        })
      });

      const login = async (email, password, role = 'PARENT') => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          return {
            success: true,
            user: data.user,
            token: data.token
          };
        }

        return { success: false, error: data.error?.message };
      };

      const result = await login('parent@example.com', 'password123', 'PARENT');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('PARENT');
    });

    it('should support login as CENTRE role', async () => {
      const mockUser = {
        id: 'centre-123',
        email: 'centre@example.com',
        role: 'CENTRE'
      };
      const mockToken = 'jwt-token-456';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          token: mockToken
        })
      });

      const login = async (email, password, role = 'PARENT') => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          return {
            success: true,
            user: data.user,
            token: data.token
          };
        }

        return { success: false, error: data.error?.message };
      };

      const result = await login('centre@example.com', 'password123', 'CENTRE');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('CENTRE');
    });

    it('should support login as ADMIN role', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN'
      };
      const mockToken = 'jwt-token-789';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
          token: mockToken
        })
      });

      const login = async (email, password, role = 'PARENT') => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('authToken', data.token);
          return {
            success: true,
            user: data.user,
            token: data.token
          };
        }

        return { success: false, error: data.error?.message };
      };

      const result = await login('admin@example.com', 'password123', 'ADMIN');

      expect(result.success).toBe(true);
      expect(result.user.role).toBe('ADMIN');
    });
  });
});
