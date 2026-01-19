/**
 * Error Helper Utility
 * Provides utilities for error message handling (English-only)
 */

/**
 * Get error message from error key
 * @param {string} errorKey - The key to look up in the errors object
 * @param {object} errors - Object containing error messages mapped by keys
 * @returns {string} The error message or the errorKey if not found
 */
function getErrorMessage(errorKey, errors) {
  if (!errorKey) {
    return 'An error occurred';
  }

  const error = errors[errorKey];
  
  if (!error) {
    return errorKey;
  }
  
  // If error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }
  
  // If error is an object, return the message property or the errorKey
  if (typeof error === 'object' && error.message) {
    return error.message;
  }
  
  return errorKey;
}

module.exports = {
  getErrorMessage,
};
