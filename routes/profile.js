const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { uploadProfilePicture, handleMulterError } = require('../middleware/upload');

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information. Send as multipart/form-data. Use the "profilePicture" field to upload an image file (jpg, jpeg, png, webp; max 20MB). Other fields (firstName, lastName, bio) are optional text fields.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
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
 *                 format: binary
 *                 description: Profile picture image file (jpg, jpeg, png, webp; max 20MB)
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
router.put('/', authenticate, uploadProfilePicture, handleMulterError, profileController.updateProfile);

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

/**
 * @swagger
 * /api/profile/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the authenticated user's password. Requires old password verification and a new password.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *                 example: NewPass456!
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                         message:
 *                           type: string
 *                           example: Password changed successfully
 *       400:
 *         description: Validation error or incorrect old password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               oldPasswordRequired:
 *                 summary: Old password required
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Old password is required"
 *                     stacktrace: null
 *               newPasswordRequired:
 *                 summary: New password required
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "New password is required"
 *                     stacktrace: null
 *               passwordTooShort:
 *                 summary: Password too short
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Password must be at least 6 characters long"
 *                     stacktrace: null
 *               incorrectOldPassword:
 *                 summary: Incorrect old password
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: "Old password is incorrect"
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
router.post('/change-password', authenticate, profileController.changePassword);

module.exports = router;
