/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Service unique identifier
 *           example: 507f1f77bcf86cd799439011
 *         vendor:
 *           type: object
 *           description: Vendor who created the service
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             profilePicture:
 *               type: string
 *               nullable: true
 *         listingType:
 *           type: string
 *           enum: [hourly, fixed]
 *           description: Type of service listing
 *           example: hourly
 *         category:
 *           type: string
 *           description: Service category
 *           example: Photographer
 *         listingTitle:
 *           type: string
 *           maxLength: 200
 *           description: Service title
 *           example: Professional Wedding Photography
 *         listingDescription:
 *           type: string
 *           maxLength: 2000
 *           description: Detailed service description
 *           example: High-quality wedding photography with professional equipment
 *         packageSpecifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Selected package specifications
 *           example: ["High Resolution Photos", "Photo Retouching/Editing"]
 *         servicingArea:
 *           type: array
 *           items:
 *             type: string
 *           description: Cities/areas where service is offered
 *           example: ["Toronto", "Mississauga", "Brampton"]
 *         pricePerHour:
 *           type: number
 *           description: Price per hour (for hourly booking)
 *           example: 150
 *         pricingOptions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PricingOption'
 *           description: Pricing options (for fixed booking)
 *         bookingStartInterval:
 *           type: string
 *           enum: [every_hour, every_half_hour, every_quarter_hour]
 *           description: Booking interval (for hourly booking)
 *           example: every_hour
 *         availability:
 *           type: object
 *           description: Service availability schedule
 *           properties:
 *             timezone:
 *               type: string
 *               description: Timezone for the schedule
 *               example: America/Toronto
 *             weeklySchedule:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DailySchedule'
 *         photos:
 *           type: array
 *           items:
 *             type: string
 *           description: Service photos (S3 URLs, max 10)
 *           maxItems: 10
 *           example: ["https://s3.amazonaws.com/bucket/photo1.jpg", "https://s3.amazonaws.com/bucket/photo2.jpg"]
 *         status:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 *           description: Service status
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     PricingOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Pricing option unique identifier
 *         name:
 *           type: string
 *           description: Name of the pricing package
 *           example: Premium Package - 2 Hours - No Add-ons Included
 *         pricePerSession:
 *           type: number
 *           description: Price for this session
 *           example: 300
 *         sessionLength:
 *           type: object
 *           properties:
 *             hours:
 *               type: number
 *               example: 2
 *             minutes:
 *               type: number
 *               example: 0
 * 
 *     TimeSlot:
 *       type: object
 *       description: A time slot within a day's schedule
 *       properties:
 *         startTime:
 *           type: string
 *           description: Start time in HH:MM format (24-hour)
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           description: End time in HH:MM format (24-hour)
 *           example: "17:00"
 * 
 *     DailySchedule:
 *       type: object
 *       description: Availability for a single day of the week
 *       properties:
 *         dayOfWeek:
 *           type: string
 *           enum: [sunday, monday, tuesday, wednesday, thursday, friday, saturday]
 *           description: Day of the week
 *         isAvailable:
 *           type: boolean
 *           description: Whether the vendor is available on this day
 *           default: false
 *         timeSlots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *           description: Time slots when the vendor is available
 * 
 *     CreateServiceRequest:
 *       type: object
 *       description: |
 *         Schema for reference only. Actual requests must use multipart/form-data.
 *         Photos must be uploaded as files (not URLs) using the 'photos' field.
 *       required:
 *         - listingType
 *         - category
 *         - listingTitle
 *         - listingDescription
 *         - servicingArea
 *       properties:
 *         listingType:
 *           type: string
 *           enum: [hourly, fixed]
 *           description: Type of service listing
 *           example: hourly
 *         category:
 *           type: string
 *           description: Service category
 *           example: Photographer
 *         listingTitle:
 *           type: string
 *           maxLength: 200
 *           description: Service title
 *           example: Professional Wedding Photography
 *         listingDescription:
 *           type: string
 *           maxLength: 2000
 *           description: Detailed service description
 *           example: High-quality wedding photography with professional equipment
 *         packageSpecifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Selected package specifications
 *           example: ["High Resolution Photos", "Photo Retouching/Editing"]
 *         servicingArea:
 *           type: array
 *           items:
 *             type: string
 *           description: Cities/areas where service is offered
 *           example: ["Toronto", "Mississauga"]
 *         pricePerHour:
 *           type: number
 *           description: Price per hour (required for hourly booking)
 *           example: 150
 *         bookingStartInterval:
 *           type: string
 *           enum: [every_hour, every_half_hour, every_quarter_hour]
 *           description: Booking interval (required for hourly booking)
 *           example: every_hour
 *         pricingOptions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Package - 2 Hours
 *               pricePerSession:
 *                 type: number
 *                 example: 300
 *               sessionLength:
 *                 type: object
 *                 properties:
 *                   hours:
 *                     type: number
 *                     example: 2
 *                   minutes:
 *                     type: number
 *                     example: 0
 *           description: Pricing options (required for fixed booking)
 * 
 *     UpdateServiceRequest:
 *       type: object
 *       properties:
 *         listingTitle:
 *           type: string
 *           maxLength: 200
 *         listingDescription:
 *           type: string
 *           maxLength: 2000
 *         packageSpecifications:
 *           type: array
 *           items:
 *             type: string
 *         servicingArea:
 *           type: array
 *           items:
 *             type: string
 *         pricePerHour:
 *           type: number
 *         pricingOptions:
 *           type: array
 *           items:
 *             type: object
 *         bookingStartInterval:
 *           type: string
 *           enum: [every_hour, every_half_hour, every_quarter_hour]
 *         status:
 *           type: string
 *           enum: [draft, active, inactive, archived]
 * 
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Category unique identifier
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           description: Category name
 *           example: Photographer
 *         slug:
 *           type: string
 *           description: Category slug
 *           example: photographer
 *         packageSpecifications:
 *           type: array
 *           items:
 *             type: string
 *           description: Available package specifications for this category
 *           example: ["High Resolution Photos", "High Resolution Video Recording"]
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     City:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: City unique identifier
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           description: City name
 *           example: Toronto
 *         province:
 *           type: string
 *           description: Province name
 *           example: Ontario
 *         country:
 *           type: string
 *           description: Country name
 *           example: Canada
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
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
