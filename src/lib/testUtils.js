/**
 * Test Utilities
 * Shared helpers for test files
 */

import { randomUUID } from 'crypto';

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
