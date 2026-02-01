/**
 * Validation utilities for tuition centre data
 */

/**
 * Validate phone number format
 * Phone numbers should contain only digits and optionally a leading '+'
 * 
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required and must be a string'
    };
  }

  const trimmed = phoneNumber.trim();
  
  if (trimmed === '') {
    return {
      isValid: false,
      error: 'Phone number cannot be empty'
    };
  }

  // Phone number should only contain digits and optionally a leading '+'
  const phoneRegex = /^\+?\d+$/;
  
  if (!phoneRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number must contain only digits and optionally a leading \'+\''
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Sanitize phone number by stripping formatting characters
 * Keeps only digits and optional leading '+'
 * 
 * @param {string} phoneNumber - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export function sanitizePhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }

  // Strip all non-digit characters except leading '+'
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure only one '+' at the beginning
  if (cleaned.startsWith('+')) {
    // Keep the leading '+' and remove any other '+' characters
    return '+' + cleaned.slice(1).replace(/\+/g, '');
  }
  
  return cleaned;
}
