const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information (firstName, lastName, profilePicture, bio)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *                 example: John
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *                 example: Doe
 *               profilePicture:
 *                 type: string
 *                 nullable: true
 *                 example: https://example.com/profile.jpg
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 example: Software developer and tech enthusiast
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         profilePicture:
 *                           type: string
 *                           nullable: true
 *                           example: https://example.com/profile.jpg
 *                         bio:
 *                           type: string
 *                           nullable: true
 *                           example: Software developer and tech enthusiast
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emptyFirstName:
 *                 summary: Empty first name
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "First name is required"
 *                     stacktrace: null
 *               emptyLastName:
 *                 summary: Empty last name
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Last name is required"
 *                     stacktrace: null
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/', authenticate, profileController.updateProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete user account
 *     description: Delete the authenticated user's account permanently
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', authenticate, profileController.deleteAccount);

module.exports = router;
