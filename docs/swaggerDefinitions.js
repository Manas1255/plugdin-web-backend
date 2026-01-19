/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User unique identifier
 *           example: 507f1f77bcf86cd799439011
 *         role:
 *           type: string
 *           enum: [client, vendor]
 *           description: User role
 *           example: client
 *         firstName:
 *           type: string
 *           maxLength: 50
 *           description: User first name
 *           example: John
 *         lastName:
 *           type: string
 *           maxLength: 50
 *           description: User last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: john.doe@example.com
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           description: URL to user profile picture
 *           example: null
 *         bio:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           description: User bio
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User last update timestamp
 *           example: 2024-01-01T00:00:00.000Z
 * 
 *     ClientSignUpRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: User first name
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: User last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User email address (must be unique)
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: User password (minimum 6 characters)
 *           example: password123
 * 
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 *           example: password123
 * 
 *     LoginResponse:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [client, vendor]
 *           description: User role
 *           example: client
 *         firstName:
 *           type: string
 *           description: User first name
 *           example: John
 *         lastName:
 *           type: string
 *           description: User last name
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: john.doe@example.com
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           description: URL to user profile picture
 *           example: null
 *         bio:
 *           type: string
 *           nullable: true
 *           description: User bio
 *           example: null
 * 
 *     Error:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Error timestamp
 *           example: 2024-01-01T00:00:00.000Z
 *         message:
 *           type: string
 *           description: Error message
 *           example: User already exists with this email
 *         stacktrace:
 *           type: string
 *           nullable: true
 *           description: Error stack trace (only in development)
 *           example: null
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           description: HTTP status code
 *           example: 201
 *         data:
 *           type: object
 *           description: Response data
 *         error:
 *           type: object
 *           nullable: true
 *           $ref: '#/components/schemas/Error'
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         data:
 *           type: object
 *           nullable: true
 *           description: Response data (null on error)
 *         error:
 *           type: object
 *           $ref: '#/components/schemas/Error'
 * 
 *     HealthCheckResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Server health status
 *           example: true
 *         message:
 *           type: string
 *           description: Health check message
 *           example: Server is running
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Server timestamp
 *           example: 2024-01-01T00:00:00.000Z
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token authentication
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server health status and current timestamp. Used to verify that the API is running.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheckResponse'
 *             example:
 *               success: true
 *               message: "Server is running"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 */
module.exports = {};
