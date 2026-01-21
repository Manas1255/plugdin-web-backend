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
  
  // Service errors
  SERVICE_NOT_FOUND: 'Service not found',
  SERVICE_ALREADY_EXISTS: 'A service with this title already exists for your account',
  INVALID_CATEGORY: 'Invalid category selected',
  INVALID_SERVICING_AREA: 'One or more servicing areas are invalid',
  INVALID_HOURLY_PRICE: 'Valid price per hour is required for hourly booking',
  INVALID_PRICING_OPTION: 'Invalid pricing option details',
  INVALID_SESSION_LENGTH: 'Session length must be greater than 0',
  PRICING_OPTIONS_REQUIRED: 'At least one pricing option is required for fixed booking',
  BOOKING_INTERVAL_REQUIRED: 'Booking start interval is required for hourly booking',
  
  // Availability errors
  INVALID_AVAILABILITY: 'Invalid availability schedule provided',
  INVALID_AVAILABILITY_FORMAT: 'Availability format is invalid',
  INVALID_TIME_SLOT: 'Invalid time slot format',
  TIME_SLOT_OVERLAP: 'Time slots cannot overlap',
  
  // Photo errors
  INVALID_PHOTOS_FORMAT: 'Photos must be an array of URLs',
  MAX_PHOTOS_EXCEEDED: 'Maximum 10 photos allowed per service',
  INVALID_PHOTO_URL: 'Invalid photo URL provided',
  
  // Category errors
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_ALREADY_EXISTS: 'Category already exists',
  
  // City errors
  CITY_NOT_FOUND: 'City not found',
  
  // Date filtering errors
  INVALID_DATE_RANGE: 'Both start date and end date are required for date range filtering',
  INVALID_DATE_FORMAT: 'Invalid date format. Please provide valid dates in ISO format (YYYY-MM-DD)',
  
  // Vendor Application errors
  APPLICATION_NOT_FOUND: 'Vendor application not found',
  APPLICATION_ALREADY_PENDING: 'You already have a pending vendor application. Please wait for review.',
  APPLICATION_ALREADY_APPROVED: 'This vendor application has already been approved',
  APPLICATION_ALREADY_REJECTED: 'This vendor application has already been rejected',
  COMPANY_NAME_REQUIRED: 'Company name is required',
  BIO_REQUIRED: 'Bio is required',
  SERVICE_TYPE_REQUIRED: 'Service type is required',
  RESPONSE_TIME_REQUIRED: 'Typical response time to inquiries is required',
  BOOKING_ADVANCE_REQUIRED: 'Booking advance and comfort with window information is required',
  BACKUP_EQUIPMENT_REQUIRED: 'Backup equipment information is required (true/false)',
  SERVICE_AGREEMENT_REQUIRED: 'Standard service agreement information is required (true/false)',
  INVALID_APPROVAL_TOKEN: 'Invalid or expired approval token',
  APPROVAL_TOKEN_EXPIRED: 'This approval link has expired. Please use the admin panel to review the application.',
  USER_ALREADY_EXISTS: 'A user with this email already exists',
};

module.exports = errorMessages;
