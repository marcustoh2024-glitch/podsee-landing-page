'use client';

import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext provides authentication state and methods throughout the app
 * Manages user session, token persistence, and authentication operations
 */
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the app and provides auth state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount and validate it
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        
        if (storedToken) {
          // Validate token by calling the API
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Token is invalid or expired, clear it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * Login function - authenticates user and stores token
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (PARENT, CENTRE, ADMIN)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password, role = 'PARENT') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during login'
      };
    }
  };

  /**
   * Logout function - clears user session and token
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
