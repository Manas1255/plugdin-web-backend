const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController');

/**
 * Stripe Webhook Route
 * IMPORTANT: This route MUST use raw body middleware
 * The raw body is required for Stripe webhook signature verification
 * Note: Raw body middleware is applied in index.js before JSON middleware
 */
router.post('/stripe', stripeWebhookController.handleStripeWebhook);

module.exports = router;
