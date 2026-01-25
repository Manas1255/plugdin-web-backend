const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bookingRequestRepository = require('../repositories/bookingRequestRepository');
const { sendResponse } = require('../utils/responseHelper');

/**
 * Handle Stripe webhook events
 * IMPORTANT: This route must use raw body middleware
 */
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return sendResponse(res, 400, null, {
            message: `Webhook Error: ${err.message}`
        });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'setup_intent.succeeded':
                await handleSetupIntentSucceeded(event.data.object);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;

            case 'payment_intent.requires_action':
                await handlePaymentIntentRequiresAction(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        return sendResponse(res, 200, { received: true }, null);

    } catch (error) {
        console.error('Webhook handler error:', error);
        return sendResponse(res, 500, null, {
            message: 'Webhook handler error',
            error: error.message
        });
    }
};

/**
 * Handle setup_intent.succeeded event
 */
const handleSetupIntentSucceeded = async (setupIntent) => {
    try {
        const bookingRequest = await bookingRequestRepository.findBySetupIntentId(setupIntent.id);

        if (!bookingRequest) {
            console.log(`Booking request not found for setup intent: ${setupIntent.id}`);
            return;
        }

        // Extract payment method
        const paymentMethodId = setupIntent.payment_method;

        if (!paymentMethodId) {
            console.log(`Payment method not found in setup intent: ${setupIntent.id}`);
            return;
        }

        // Update booking request if not already updated
        if (bookingRequest.status === 'payment_pending' && !bookingRequest.stripePaymentMethodId) {
            await bookingRequestRepository.updateById(bookingRequest._id, {
                stripePaymentMethodId: paymentMethodId,
                status: 'pending_vendor'
            });
            console.log(`Updated booking request ${bookingRequest._id} with payment method`);
        }

    } catch (error) {
        console.error('Error handling setup_intent.succeeded:', error);
        throw error;
    }
};

/**
 * Handle payment_intent.succeeded event
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
    try {
        const bookingRequest = await bookingRequestRepository.findByPaymentIntentId(paymentIntent.id);

        if (!bookingRequest) {
            console.log(`Booking request not found for payment intent: ${paymentIntent.id}`);
            return;
        }

        // Update booking request to paid status
        if (bookingRequest.status !== 'paid') {
            await bookingRequestRepository.updateById(bookingRequest._id, {
                status: 'paid'
            });
            console.log(`Updated booking request ${bookingRequest._id} to paid status`);
        }

    } catch (error) {
        console.error('Error handling payment_intent.succeeded:', error);
        throw error;
    }
};

/**
 * Handle payment_intent.payment_failed event
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
    try {
        const bookingRequest = await bookingRequestRepository.findByPaymentIntentId(paymentIntent.id);

        if (!bookingRequest) {
            console.log(`Booking request not found for payment intent: ${paymentIntent.id}`);
            return;
        }

        // Update booking request to payment_failed status
        if (bookingRequest.status !== 'payment_failed') {
            await bookingRequestRepository.updateById(bookingRequest._id, {
                status: 'payment_failed'
            });
            console.log(`Updated booking request ${bookingRequest._id} to payment_failed status`);
        }

    } catch (error) {
        console.error('Error handling payment_intent.payment_failed:', error);
        throw error;
    }
};

/**
 * Handle payment_intent.requires_action event
 */
const handlePaymentIntentRequiresAction = async (paymentIntent) => {
    try {
        const bookingRequest = await bookingRequestRepository.findByPaymentIntentId(paymentIntent.id);

        if (!bookingRequest) {
            console.log(`Booking request not found for payment intent: ${paymentIntent.id}`);
            return;
        }

        // Update booking request to action_required status
        if (bookingRequest.status !== 'action_required') {
            await bookingRequestRepository.updateById(bookingRequest._id, {
                status: 'action_required'
            });
            console.log(`Updated booking request ${bookingRequest._id} to action_required status`);
        }

    } catch (error) {
        console.error('Error handling payment_intent.requires_action:', error);
        throw error;
    }
};

module.exports = {
    handleStripeWebhook
};
