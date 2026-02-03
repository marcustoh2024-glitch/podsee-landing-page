import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AuthService from './authService.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

describe('AuthService Unit Tests', () => {
  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testpassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should throw error for empty password', async () => {
      await expect(authService.hashPassword('')).rejects.toThrow('Password is required');
    });

    it('should throw error for non-string password', async () => {
      await expect(authService.hashPassword(null)).rejects.toThrow('Password is required');
      await expect(authService.hashPassword(undefined)).rejects.toThrow('Password is required');
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('authenticate - valid scenarios', () => {
    it('should create new user with valid credentials', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      
      const result = await authService.authenticate(email, password);
      
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.role).toBe('PARENT');
      expect(result.user.passwordHash).toBeUndefined();
      expect(result.token).toBeDefined();
    });

    it('should retrieve existing user with valid password', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      
      // Create user first
      const result1 = await authService.authenticate(email, password);
      const userId = result1.user.id;
      
      // Authenticate again with same credentials
      const result2 = await authService.authenticate(email, password);
      
      expect(result2.user.id).toBe(userId);
      expect(result2.user.email).toBe(email);
      expect(result2.token).toBeDefined();
    });

    it('should create user with specified role', async () => {
      const email = 'centre@example.com';
      const password = 'password123';
      
      const result = await authService.authenticate(email, password, 'CENTRE');
      
      expect(result.user.role).toBe('CENTRE');
    });
  });

  describe('authenticate - invalid password scenarios', () => {
    it('should reject authentication with wrong password', async () => {
      const email = 'user@example.com';
      const correctPassword = 'correctpass123';
      const wrongPassword = 'wrongpass123';
      
      // Create user
      await authService.authenticate(email, correctPassword);
      
      // Try to authenticate with wrong password
      await expect(
        authService.authenticate(email, wrongPassword)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject password shorter than 8 characters', async () => {
      const email = 'user@example.com';
      const shortPassword = 'short';
      
      await expect(
        authService.authenticate(email, shortPassword)
      ).rejects.toThrow('Password must be at least 8 characters');
    });
  });

  describe('authenticate - non-existent user scenarios', () => {
    it('should create new user when email does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      const result = await authService.authenticate(email, password);
      
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.id).toBeDefined();
    });
  });

  describe('authenticate - validation errors', () => {
    it('should reject missing email', async () => {
      await expect(
        authService.authenticate('', 'password123')
      ).rejects.toThrow('Email and password are required');
    });

    it('should reject missing password', async () => {
      await expect(
        authService.authenticate('user@example.com', '')
      ).rejects.toThrow('Email and password are required');
    });

    it('should reject invalid email format', async () => {
      await expect(
        authService.authenticate('notanemail', 'password123')
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('validateSession', () => {
    it('should validate valid token and return user', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      
      const { token, user } = await authService.authenticate(email, password);
      const validatedUser = await authService.validateSession(token);
      
      expect(validatedUser.id).toBe(user.id);
      expect(validatedUser.email).toBe(user.email);
      expect(validatedUser.role).toBe(user.role);
      expect(validatedUser.passwordHash).toBeUndefined();
    });

    it('should reject missing token', async () => {
      await expect(
        authService.validateSession('')
      ).rejects.toThrow('Token is required');
    });

    it('should reject invalid token', async () => {
      await expect(
        authService.validateSession('invalid-token')
      ).rejects.toThrow('Invalid token');
    });

    it('should reject expired token', async () => {
      const email = 'user@example.com';
      
      // Create expired token
      const expiredToken = jwt.sign(
        { userId: 'test-id', email, role: 'PARENT' },
        authService.jwtSecret,
        { expiresIn: '-1h' }
      );
      
      await expect(
        authService.validateSession(expiredToken)
      ).rejects.toThrow('Token expired');
    });

    it('should reject token for non-existent user', async () => {
      // Create token with non-existent user ID
      const fakeToken = jwt.sign(
        { userId: 'non-existent-id', email: 'fake@example.com', role: 'PARENT' },
        authService.jwtSecret,
        { expiresIn: '1h' }
      );
      
      await expect(
        authService.validateSession(fakeToken)
      ).rejects.toThrow('User not found');
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'PARENT'
      };
      
      const token = authService.generateToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token structure
      const decoded = jwt.verify(token, authService.jwtSecret);
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });
});
