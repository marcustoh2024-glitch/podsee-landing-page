import { prisma } from '../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Service class for user authentication
 * Handles password hashing, user authentication, and session validation
 */
class AuthService {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
    this.saltRounds = 10;
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    this.jwtExpiresIn = '24h';
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required and must be a string');
    }
    
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Authenticate user with email and password
   * Creates a new user if email doesn't exist, otherwise validates password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (PARENT, CENTRE, ADMIN) - defaults to PARENT
   * @returns {Promise<{user: Object, token: string}>} User data and JWT token
   */
  async authenticate(email, password, role = 'PARENT') {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.code = 'MISSING_CREDENTIALS';
      throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.code = 'INVALID_EMAIL';
      throw error;
    }

    // Validate password length
    if (password.length < 8) {
      const error = new Error('Password must be at least 8 characters');
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // User exists - validate password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        const error = new Error('Invalid credentials');
        error.code = 'INVALID_CREDENTIALS';
        throw error;
      }
    } else {
      // User doesn't exist - create new user
      const passwordHash = await this.hashPassword(password);
      
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role
        }
      });
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Generate JWT token with user ID and role
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  /**
   * Validate session token and return user
   * @param {string} token - JWT session token
   * @returns {Promise<Object>} User object
   */
  async validateSession(token) {
    if (!token) {
      const error = new Error('Token is required');
      error.code = 'MISSING_TOKEN';
      throw error;
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(token, this.jwtSecret);

      // Fetch user from database
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        throw error;
      }

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const error = new Error('Token expired');
        error.code = 'TOKEN_EXPIRED';
        throw error;
      } else if (err.name === 'JsonWebTokenError') {
        const error = new Error('Invalid token');
        error.code = 'INVALID_TOKEN';
        throw error;
      }
      throw err;
    }
  }
}

export default AuthService;
