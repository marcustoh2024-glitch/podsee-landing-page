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

/**
 * Validate website URL format
 * URLs must start with http:// or https://
 * 
 * @param {string} url - URL to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
export function validateUrl(url) {
  // Null or undefined URLs are valid (optional field)
  if (url === null || url === undefined) {
    return {
      isValid: true,
      error: null
    };
  }

  if (typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL must be a string'
    };
  }

  const trimmed = url.trim();
  
  // Empty string is treated as null (valid for optional field)
  if (trimmed === '') {
    return {
      isValid: true,
      error: null
    };
  }

  // URL must start with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://'
    };
  }

  // Basic URL format validation
  try {
    new URL(trimmed);
    return {
      isValid: true,
      error: null
    };
  } catch (e) {
    return {
      isValid: false,
      error: 'URL format is invalid'
    };
  }
}
