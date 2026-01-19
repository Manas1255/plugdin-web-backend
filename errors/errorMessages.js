/**
 * Error Messages Dictionary
 * Centralized error messages for the application
 */

const errorMessages = {
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required',
  AUTH_INVALID: 'Invalid authentication credentials',
  AUTH_EXPIRED: 'Authentication token has expired',
  AUTH_FORBIDDEN: 'You do not have permission to access this resource',
  TOKEN_REQUIRED: 'Authentication token is required',
  INVALID_TOKEN: 'Invalid or malformed authentication token',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_NOT_VERIFIED: 'Account is not verified. Please verify your account to continue',
  AUTHENTICATION_REQUIRED: 'Authentication is required to access this resource',
  ACCESS_DENIED: 'You do not have permission to access this resource',
  ROLE_NOT_FOUND: 'Role not found',
  
  // User errors
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'User already exists with this email',
  USER_INVALID_CREDENTIALS: 'Invalid email or password',
  USER_INACTIVE: 'User account is inactive',
  
  // Validation errors
  VALIDATION_ERROR: 'Validation error',
  VALIDATION_REQUIRED: 'This field is required',
  FIRST_NAME_REQUIRED: 'First name is required',
  LAST_NAME_REQUIRED: 'Last name is required',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  VALIDATION_INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  VALIDATION_INVALID_FORMAT: 'Invalid format',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
  
  // General errors
  INTERNAL_ERROR: 'An internal server error occurred',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  
  // Database errors
  DB_CONNECTION_ERROR: 'Database connection error',
  DB_QUERY_ERROR: 'Database query error',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  FILE_INVALID_TYPE: 'Invalid file type',
  FILE_UPLOAD_ERROR: 'Error uploading file',
};

module.exports = errorMessages;
