const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController');

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     summary: Stripe webhook handler
 *     description: |
 *       Receives Stripe webhook events for payment processing. Used by Stripe to notify
 *       the application of events (e.g. setup_intent.succeeded, payment_intent.succeeded).
 *       **Important:** This endpoint uses raw body; Stripe verifies requests via the
 *       stripe-signature header. No Bearer auth — Stripe signs the payload.
 *     tags: [Stripe]
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw webhook payload from Stripe (forwarded as JSON for docs)
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid signature or malformed payload
 *       500:
 *         description: Webhook processing error
 */
router.post('/stripe', stripeWebhookController.handleStripeWebhook);

module.exports = router;
