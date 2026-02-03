import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import AuthService from './authService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const authService = new AuthService(prisma);

describe('Feature: community-forum - AuthService Property Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.comment.deleteMany();
    await prisma.discussionThread.deleteMany();
    await prisma.user.deleteMany();
  });

  /**
   * Property 1: Valid credentials create or retrieve user
   * For any valid email and password combination, authenticating should return 
   * a user account (either newly created or existing)
   * Validates: Requirements 1.1
   */
  it('Property 1: Valid credentials create or retrieve user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        fc.constantFrom('PARENT', 'CENTRE', 'ADMIN'),
        async (email, password, role) => {
          // First authentication should create user
          const result1 = await authService.authenticate(email, password, role);
          
          expect(result1).toBeDefined();
          expect(result1.user).toBeDefined();
          expect(result1.user.email).toBe(email);
          expect(result1.user.role).toBe(role);
          expect(result1.user.id).toBeDefined();
          
          // Second authentication with same credentials should retrieve same user
          const result2 = await authService.authenticate(email, password, role);
          
          expect(result2).toBeDefined();
          expect(result2.user).toBeDefined();
          expect(result2.user.id).toBe(result1.user.id);
          expect(result2.user.email).toBe(email);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 2: Successful authentication issues token
   * For any user who successfully authenticates, the system should return 
   * a valid session token
   * Validates: Requirements 1.2
   */
  it('Property 2: Successful authentication issues token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (email, password) => {
          const result = await authService.authenticate(email, password);
          
          expect(result.token).toBeDefined();
          expect(typeof result.token).toBe('string');
          expect(result.token.length).toBeGreaterThan(0);
          
          // Token should have JWT format (three parts separated by dots)
          const tokenParts = result.token.split('.');
          expect(tokenParts.length).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 3: Valid tokens authorize write operations
   * For any user with a valid session token, the system should allow 
   * comment creation and other write operations
   * Validates: Requirements 1.3
   */
  it('Property 3: Valid tokens authorize write operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (email, password) => {
          // Authenticate and get token
          const { token, user } = await authService.authenticate(email, password);
          
          // Validate the token
          const validatedUser = await authService.validateSession(token);
          
          expect(validatedUser).toBeDefined();
          expect(validatedUser.id).toBe(user.id);
          expect(validatedUser.email).toBe(user.email);
          expect(validatedUser.role).toBe(user.role);
          
          // Ensure password hash is not exposed
          expect(validatedUser.passwordHash).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
