import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validatePhoneNumber, sanitizePhoneNumber, validateUrl } from './validation.js';

describe('Validation - Property Tests', () => {
  // Feature: tuition-search-backend, Property 12: Phone number sanitization
  // Validates: Requirements 7.4, 10.2
  it('Property 12: Phone number sanitization', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate phone numbers with various formatting
        fc.oneof(
          // Valid formats with formatting characters
          fc.stringMatching(/^\+\d{1,3} \d{3} \d{3} \d{4}$/), // +65 123 456 7890
          fc.stringMatching(/^\+\d{1,3}-\d{3}-\d{3}-\d{4}$/), // +65-123-456-7890
          fc.stringMatching(/^\+\d{1,3}\(\d{3}\)\d{3}-\d{4}$/), // +65(123)456-7890
          fc.stringMatching(/^\d{3}-\d{3}-\d{4}$/), // 123-456-7890
          fc.stringMatching(/^\d{3} \d{3} \d{4}$/), // 123 456 7890
          fc.stringMatching(/^\(\d{3}\) \d{3}-\d{4}$/), // (123) 456-7890
          fc.stringMatching(/^\+\d{10,12}$/), // +6591234567 (already clean)
          fc.stringMatching(/^\d{8,12}$/), // 91234567 (already clean)
          fc.stringMatching(/^\+\d{1,3}\.\d{3}\.\d{3}\.\d{4}$/), // +65.123.456.7890
          fc.stringMatching(/^\d{3}\.\d{3}\.\d{4}$/) // 123.456.7890
        ),
        async (phoneNumber) => {
          // Sanitize the phone number
          const sanitized = sanitizePhoneNumber(phoneNumber);

          // Property 1: Sanitized number should only contain digits and optional leading '+'
          expect(sanitized).toMatch(/^\+?\d*$/);

          // Property 2: If original had a '+', sanitized should start with '+'
          if (phoneNumber.includes('+')) {
            expect(sanitized.startsWith('+')).toBe(true);
            // Should have exactly one '+' at the beginning
            expect(sanitized.match(/\+/g)?.length || 0).toBe(1);
          }

          // Property 3: All digits from original should be preserved
          const originalDigits = phoneNumber.replace(/\D/g, '');
          const sanitizedDigits = sanitized.replace(/\+/g, '');
          expect(sanitizedDigits).toBe(originalDigits);

          // Property 4: Sanitized number should be valid according to validatePhoneNumber
          const validation = validatePhoneNumber(sanitized);
          expect(validation.isValid).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: Validate that sanitization removes all formatting characters
  it('Property 12 (edge cases): Sanitization removes all formatting characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^\d{8,12}$/), // Base digits
        fc.constantFrom(' ', '-', '.', '(', ')', '[', ']', '{', '}'), // Formatting chars
        async (digits, formatChar) => {
          // Insert formatting characters randomly
          const formatted = digits.split('').join(formatChar);
          
          // Sanitize
          const sanitized = sanitizePhoneNumber(formatted);

          // Should only contain the original digits
          expect(sanitized).toBe(digits);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Test with leading '+' preservation
  it('Property 12 (leading +): Leading + is preserved, others removed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^\d{8,12}$/), // Base digits
        async (digits) => {
          // Add leading '+' and some formatting
          const formatted = `+${digits.substring(0, 2)}-${digits.substring(2)}`;
          
          // Sanitize
          const sanitized = sanitizePhoneNumber(formatted);

          // Should start with '+' and contain all digits
          expect(sanitized).toBe(`+${digits}`);
          expect(sanitized.startsWith('+')).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: tuition-search-backend, Property 7: Website URL validation
  // Validates: Requirements 8.2
  it('Property 7: Website URL validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Valid URLs with http://
          fc.webUrl().map(url => url.replace('https://', 'http://')),
          // Valid URLs with https://
          fc.webUrl(),
          // Invalid URLs without protocol
          fc.domain().map(domain => domain),
          // Invalid URLs with wrong protocol
          fc.domain().map(domain => `ftp://${domain}`),
          fc.domain().map(domain => `file://${domain}`),
          // Null and undefined (valid for optional field)
          fc.constant(null),
          fc.constant(undefined),
          // Empty string (valid for optional field)
          fc.constant(''),
          // URLs with spaces (invalid)
          fc.webUrl().map(url => `${url} extra`),
          // Just protocol (invalid)
          fc.constant('http://'),
          fc.constant('https://')
        ),
        async (url) => {
          const validation = validateUrl(url);

          // Property 1: Null, undefined, and empty string should be valid (optional field)
          if (url === null || url === undefined || url === '') {
            expect(validation.isValid).toBe(true);
            expect(validation.error).toBe(null);
            return true;
          }

          // Property 2: URLs starting with http:// or https:// should be valid
          if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
            // Additional check: must be a valid URL format
            try {
              new URL(url);
              expect(validation.isValid).toBe(true);
              expect(validation.error).toBe(null);
            } catch (e) {
              // If URL constructor fails, validation should also fail
              expect(validation.isValid).toBe(false);
              expect(validation.error).toBeTruthy();
            }
            return true;
          }

          // Property 3: URLs not starting with http:// or https:// should be invalid
          if (typeof url === 'string' && url.trim() !== '') {
            expect(validation.isValid).toBe(false);
            expect(validation.error).toBeTruthy();
            expect(validation.error).toContain('http://');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: Valid URLs must start with http:// or https://
  it('Property 7 (protocol check): Valid URLs must have correct protocol', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        async (url) => {
          // All web URLs should be valid
          const validation = validateUrl(url);
          expect(validation.isValid).toBe(true);
          expect(validation.error).toBe(null);

          // URL should start with https:// (fast-check generates https URLs)
          expect(url.startsWith('https://')).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Test invalid protocols are rejected
  it('Property 7 (invalid protocols): URLs with invalid protocols are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.domain(),
        fc.constantFrom('ftp://', 'file://', 'ws://', 'wss://', 'mailto:', 'tel:'),
        async (domain, protocol) => {
          const url = `${protocol}${domain}`;
          
          const validation = validateUrl(url);
          
          // Should be invalid
          expect(validation.isValid).toBe(false);
          expect(validation.error).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
