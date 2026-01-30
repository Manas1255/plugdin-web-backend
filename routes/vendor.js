const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all registered vendors
 *     description: Retrieve a paginated list of all vendors registered on the app. Returns only id, firstName, lastName, and profilePicture for each vendor.
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully
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
 *                         vendors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: Vendor unique identifier
 *                                 example: 507f1f77bcf86cd799439011
 *                               firstName:
 *                                 type: string
 *                                 example: John
 *                               lastName:
 *                                 type: string
 *                                 example: Doe
 *                               profilePicture:
 *                                 type: string
 *                                 nullable: true
 *                                 description: URL to vendor's profile picture
 *                                 example: https://example.com/profile.jpg
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                               description: Current page number
 *                             totalPages:
 *                               type: integer
 *                               description: Total number of pages
 *                             totalItems:
 *                               type: integer
 *                               description: Total number of vendors
 *                             itemsPerPage:
 *                               type: integer
 *                               description: Number of items per page
 *                             hasNextPage:
 *                               type: boolean
 *                               description: Whether there is a next page
 *                             hasPrevPage:
 *                               type: boolean
 *                               description: Whether there is a previous page
 *                             nextPage:
 *                               type: integer
 *                               nullable: true
 *                               description: Next page number or null
 *                             prevPage:
 *                               type: integer
 *                               nullable: true
 *                               description: Previous page number or null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', vendorController.getVendors);

module.exports = router;
