const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/signup/client:
 *   post:
 *     summary: Client sign up
 *     description: Register a new client user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientSignUpRequest'
 *     responses:
 *       201:
 *         description: Client signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           example: client
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         email:
 *                           type: string
 *                           example: john.doe@example.com
 *                         profilePicture:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         bio:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *       400:
 *         description: Validation error - Missing or invalid required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingField:
 *                 summary: Missing required field
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "First name is required"
 *                     stacktrace: null
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Invalid email format"
 *                     stacktrace: null
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Password must be at least 6 characters long"
 *                     stacktrace: null
 *       409:
 *         description: User already exists with this email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 409
 *               data: null
 *               error:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *                 message: "User already exists with this email"
 *                 stacktrace: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 500
 *               data: null
 *               error:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *                 message: "An internal server error occurred"
 *                 stacktrace: null
 */
router.post('/signup/client', authController.signUpClient);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Login for both vendor and client users with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error - Missing or invalid required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingEmail:
 *                 summary: Missing email
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Email is required"
 *                     stacktrace: null
 *               missingPassword:
 *                 summary: Missing password
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Password is required"
 *                     stacktrace: null
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Invalid email format"
 *                     stacktrace: null
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               data: null
 *               error:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *                 message: "Invalid email or password"
 *                 stacktrace: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 500
 *               data: null
 *               error:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *                 message: "An internal server error occurred"
 *                 stacktrace: null
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         loggedOut:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: Unauthorized - Token required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 401
 *               data: null
 *               error:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *                 message: "Token is required"
 *                 stacktrace: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 500
 *               data: null
 *               error:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *                 message: "An internal server error occurred"
 *                 stacktrace: null
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;
