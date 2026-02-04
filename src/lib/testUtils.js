/**
 * Test Utilities
 * Shared helpers for test files
 */

import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Generate a valid UUID for testing
 * @returns {string} Valid UUID v4
 */
export function generateTestUUID() {
  return randomUUID();
}

/**
 * Generate a unique email for testing
 * Uses UUID to ensure uniqueness across test runs
 * @param {string} prefix - Email prefix (e.g., 'parent', 'centre', 'admin')
 * @returns {string} Unique email address
 */
export function generateTestEmail(prefix = 'test') {
  const uuid = randomUUID().split('-')[0]; // Use first segment for brevity
  return `${prefix}-${uuid}@example.com`;
}

/**
 * Create a valid UUID-based test ID with a readable prefix
 * Useful for debugging while maintaining UUID format
 * @param {string} prefix - Readable prefix (e.g., 'centre', 'comment', 'thread')
 * @returns {string} Valid UUID
 */
export function createTestId(prefix = 'test') {
  // Just return a UUID - the prefix is for documentation only
  return randomUUID();
}

/**
 * Clean up all test data from the database
 * CRITICAL: Deletes data in the correct order to respect foreign key constraints
 * Order: comments → discussion threads → tuition centre relations → tuition centres → users → levels/subjects
 */
export async function cleanupTestData() {
  // Delete in order of dependencies (children first, parents last)
  await prisma.comment.deleteMany();
  await prisma.discussionThread.deleteMany();
  await prisma.tuitionCentreSubject.deleteMany();
  await prisma.tuitionCentreLevel.deleteMany();
  await prisma.tuitionCentre.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.level.deleteMany();
}

/**
 * Create a test tuition centre with optional data
 */
export async function createTestCentre(data = {}) {
  return await prisma.tuitionCentre.create({
    data: {
      name: data.name || 'Test Centre',
      location: data.location || 'Test Location',
      whatsappNumber: data.whatsappNumber || '+6591234567',
      website: data.website || null
    }
  });
}

/**
 * Create a test level
 */
export async function createTestLevel(name = 'Test Level') {
  // Try to find existing level first to avoid unique constraint violations
  const existing = await prisma.level.findUnique({ where: { name } });
  if (existing) {
    return existing;
  }
  return await prisma.level.create({
    data: { name }
  });
}

/**
 * Create a test subject
 */
export async function createTestSubject(name = 'Test Subject') {
  // Try to find existing subject first to avoid unique constraint violations
  const existing = await prisma.subject.findUnique({ where: { name } });
  if (existing) {
    return existing;
  }
  return await prisma.subject.create({
    data: { name }
  });
}

/**
 * Create a test user with optional data
 */
export async function createTestUser(data = {}) {
  return await prisma.user.create({
    data: {
      email: data.email || `test-${randomUUID().split('-')[0]}@example.com`,
      passwordHash: data.passwordHash || 'hashed_password',
      username: data.username || null,
      role: data.role || 'PARENT'
    }
  });
}
