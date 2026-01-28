const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const categoryController = require('../controllers/categoryController');
const cityController = require('../controllers/cityController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadServiceImages, handleMulterError } = require('../middleware/upload');

// Public routes
/**
 * @swagger
 * /api/services/search:
 *   get:
 *     summary: Search services
 *     description: Search and filter available services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [hourly, fixed]
 *         description: Filter by listing type
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
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                         services:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Service'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             pages:
 *                               type: integer
 */
router.get('/search', serviceController.searchServices);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     description: Retrieve a specific service details
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service retrieved successfully
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
 *                         service:
 *                           $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:serviceId', serviceController.getService);

// Category routes (public)
/**
 * @swagger
 * /api/services/categories/all:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all available service categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                         count:
 *                           type: integer
 *                         categories:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Category'
 */
router.get('/categories/all', categoryController.getAllCategories);

/**
 * @swagger
 * /api/services/categories/{categorySlug}/specifications:
 *   get:
 *     summary: Get category package specifications
 *     description: Retrieve package specifications for a specific category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug (e.g., 'photographer')
 *     responses:
 *       200:
 *         description: Specifications retrieved successfully
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
 *                         category:
 *                           type: string
 *                         slug:
 *                           type: string
 *                         packageSpecifications:
 *                           type: array
 *                           items:
 *                             type: string
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/categories/:categorySlug/specifications', categoryController.getCategorySpecifications);

// City routes (public)
/**
 * @swagger
 * /api/services/cities/all:
 *   get:
 *     summary: Get all cities
 *     description: Retrieve all available cities for servicing areas
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Filter by province
 *     responses:
 *       200:
 *         description: Cities retrieved successfully
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
 *                         count:
 *                           type: integer
 *                         cities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/City'
 */
router.get('/cities/all', cityController.getAllCities);

// Protected vendor routes
/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     description: |
 *       Create a new service listing (vendor only). 
 *       
 *       **Content Type:** `multipart/form-data` (required)
 *       
 *       **File Upload Requirements:**
 *       - Photos are required (at least one image)
 *       - Allowed formats: jpg, jpeg, png, webp
 *       - Maximum 10 images per request
 *       - Maximum 20MB per file
 *       - Field name for images: `photos` (array)
 *       - Files are uploaded to S3 and URLs are automatically generated
 *       
 *       **JSON Fields in Multipart:**
 *       - Complex fields (availability, pricingOptions, servicingArea, packageSpecifications) 
 *         should be sent as JSON strings and will be automatically parsed
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - listingType
 *               - category
 *               - listingTitle
 *               - listingDescription
 *               - servicingArea
 *               - photos
 *             properties:
 *               listingType:
 *                 type: string
 *                 enum: [hourly, fixed]
 *                 description: Type of service listing
 *                 example: hourly
 *               category:
 *                 type: string
 *                 description: Service category name
 *                 example: Photographer
 *               listingTitle:
 *                 type: string
 *                 maxLength: 200
 *                 description: Service title
 *                 example: Professional Wedding Photography
 *               listingDescription:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Detailed service description
 *                 example: High-quality wedding photography with professional equipment
 *               packageSpecifications:
 *                 type: string
 *                 description: JSON array string of package specifications
 *                 example: '["High Resolution Photos", "Photo Retouching/Editing"]'
 *               servicingArea:
 *                 type: string
 *                 description: JSON array string of cities/areas
 *                 example: '["Toronto", "Mississauga", "Brampton"]'
 *               pricePerHour:
 *                 type: number
 *                 description: Price per hour (required for hourly booking)
 *                 example: 150
 *               bookingStartInterval:
 *                 type: string
 *                 enum: [every_hour, every_half_hour, every_quarter_hour]
 *                 description: Booking interval (required for hourly booking)
 *                 example: every_hour
 *               pricingOptions:
 *                 type: string
 *                 description: JSON array string of pricing options (required for fixed booking)
 *                 example: '[{"name":"Premium Package - 2 Hours","pricePerSession":300,"sessionLength":{"hours":2,"minutes":0}}]'
 *               availability:
 *                 type: string
 *                 description: JSON object string for availability schedule
 *                 example: '{"timezone":"America/Toronto","weeklySchedule":[{"dayOfWeek":"monday","isAvailable":true,"timeSlots":[{"startTime":"09:00","endTime":"17:00"}]}]}'
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: |
 *                   Service images (required, 1-10 files)
 *                   - Allowed formats: jpg, jpeg, png, webp
 *                   - Maximum 20MB per file
 *                   - Files are uploaded to S3 and URLs are returned
 *                 minItems: 1
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                           example: Service created successfully
 *                         service:
 *                           $ref: '#/components/schemas/Service'
 *             example:
 *               statusCode: 201
 *               data:
 *                 message: Service created successfully
 *                 service:
 *                   id: 507f1f77bcf86cd799439011
 *                   listingType: hourly
 *                   category: Photographer
 *                   listingTitle: Professional Wedding Photography
 *                   photos:
 *                     - https://plugdin-web-bucket.s3.amazonaws.com/services/507f1f77bcf86cd799439011/uuid1.jpg
 *                     - https://plugdin-web-bucket.s3.amazonaws.com/services/507f1f77bcf86cd799439011/uuid2.jpg
 *       400:
 *         description: Validation error (invalid file type, file too large, max files exceeded, or other validation errors)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               photosRequired:
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: Photos are required. Please upload at least one photo file.
 *               invalidFileType:
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: Only images are allowed (jpg, jpeg, png, webp)
 *               fileTooLarge:
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: File size exceeds 20MB limit
 *               maxFilesExceeded:
 *                 value:
 *                   statusCode: 400
 *                   data: null
 *                   error:
 *                     timestamp: "2024-01-01T00:00:00.000Z"
 *                     message: Maximum 10 images allowed
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Vendor role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Service already exists - A service with this title already exists for your account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error (e.g., S3 upload failure)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, authorize('vendor'), uploadServiceImages, handleMulterError, serviceController.createService);

/**
 * @swagger
 * /api/services/vendor/my-services:
 *   get:
 *     summary: Get vendor's services
 *     description: Retrieve all services for the authenticated vendor
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                         count:
 *                           type: integer
 *                         services:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/vendor/my-services', authenticate, authorize('vendor'), serviceController.getVendorServices);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   put:
 *     summary: Update service
 *     description: Update an existing service (vendor only, must own the service)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateServiceRequest'
 *     responses:
 *       200:
 *         description: Service updated successfully
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
 *                         service:
 *                           $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not the service owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:serviceId', authenticate, authorize('vendor'), serviceController.updateService);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   delete:
 *     summary: Delete service
 *     description: Delete a service (vendor only, must own the service)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Not the service owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:serviceId', authenticate, authorize('vendor'), serviceController.deleteService);

module.exports = router;
