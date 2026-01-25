const express = require('express');
const router = express.Router();
const bookingRequestController = require('../controllers/bookingRequestController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/booking-requests:
 *   post:
 *     summary: Create a new booking request
 *     description: Create a booking request and set up payment method (client only)
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - bookingStart
 *               - bookingEnd
 *               - billingDetails
 *             properties:
 *               serviceId:
 *                 type: string
 *               pricingOptionId:
 *                 type: string
 *               bookingStart:
 *                 type: string
 *                 format: date-time
 *               bookingEnd:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               billingDetails:
 *                 type: object
 *                 required:
 *                   - name
 *                   - address
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: object
 *                     properties:
 *                       line1:
 *                         type: string
 *                       line2:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       country:
 *                         type: string
 *     responses:
 *       201:
 *         description: Booking request created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Client role required
 */
router.post('/', authenticate, authorize('client'), bookingRequestController.createBookingRequest);

/**
 * @swagger
 * /api/booking-requests/{id}/complete-payment-method:
 *   post:
 *     summary: Complete payment method setup
 *     description: Complete the payment method setup after client confirms card (client only)
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setupIntentId
 *             properties:
 *               setupIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment method completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking request not found
 */
router.post('/:id/complete-payment-method', authenticate, authorize('client'), bookingRequestController.completePaymentMethod);

/**
 * @swagger
 * /api/booking-requests/{id}:
 *   get:
 *     summary: Get booking request by ID
 *     description: Get booking request details (client, vendor, or admin)
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking request not found
 */
router.get('/:id', authenticate, bookingRequestController.getBookingRequest);

/**
 * @swagger
 * /api/booking-requests/client/my-bookings:
 *   get:
 *     summary: Get client's booking requests
 *     description: Get all booking requests for the authenticated client
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [payment_pending, pending_vendor, accepted, rejected, paid, payment_failed, action_required]
 *     responses:
 *       200:
 *         description: Booking requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Client role required
 */
router.get('/client/my-bookings', authenticate, authorize('client'), bookingRequestController.getClientBookingRequests);

/**
 * @swagger
 * /api/vendor/booking-requests:
 *   get:
 *     summary: Get vendor's booking requests
 *     description: Get all booking requests for the authenticated vendor
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [payment_pending, pending_vendor, accepted, rejected, paid, payment_failed, action_required]
 *     responses:
 *       200:
 *         description: Booking requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Vendor role required
 */
// Vendor routes - these will be mounted at /api/vendor, so paths should be /booking-requests
router.get('/booking-requests', authenticate, authorize('vendor'), bookingRequestController.getVendorBookingRequests);

/**
 * @swagger
 * /api/vendor/booking-requests/{id}/accept:
 *   post:
 *     summary: Vendor accepts booking request
 *     description: Vendor accepts a booking request and charges the client (vendor only)
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking request accepted and payment processed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking request not found
 *       402:
 *         description: Payment failed
 *       409:
 *         description: Booking conflict
 */
router.post('/booking-requests/:id/accept', authenticate, authorize('vendor'), bookingRequestController.acceptBookingRequest);

/**
 * @swagger
 * /api/vendor/booking-requests/{id}/reject:
 *   post:
 *     summary: Vendor rejects booking request
 *     description: Vendor rejects a booking request (vendor only)
 *     tags: [Booking Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking request rejected successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking request not found
 */
router.post('/booking-requests/:id/reject', authenticate, authorize('vendor'), bookingRequestController.rejectBookingRequest);

module.exports = router;
