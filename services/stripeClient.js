const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Service Wrapper
 * Provides a centralized interface for Stripe operations
 */

/**
 * Create or retrieve a Stripe customer
 * @param {Object} params - Customer parameters
 * @param {string} params.email - Customer email
 * @param {string} params.name - Customer name
 * @param {string} params.metadata - Optional metadata
 * @returns {Promise<Object>} Stripe customer object
 */
const createOrRetrieveCustomer = async ({ email, name, metadata = {} }) => {
    try {
        // Try to find existing customer by email
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            return existingCustomers.data[0];
        }

        // Create new customer
        return await stripe.customers.create({
            email,
            name,
            metadata
        });
    } catch (error) {
        console.error('Stripe create customer error:', error);
        throw error;
    }
};

/**
 * Create a SetupIntent for saving payment method
 * @param {Object} params - SetupIntent parameters
 * @param {string} params.customerId - Stripe customer ID
 * @param {Object} params.metadata - Optional metadata
 * @returns {Promise<Object>} Stripe SetupIntent object
 */
const createSetupIntent = async ({ customerId, metadata = {} }) => {
    try {
        return await stripe.setupIntents.create({
            customer: customerId,
            usage: 'off_session',
            metadata
        });
    } catch (error) {
        console.error('Stripe create setup intent error:', error);
        throw error;
    }
};

/**
 * Retrieve a SetupIntent
 * @param {string} setupIntentId - SetupIntent ID
 * @returns {Promise<Object>} Stripe SetupIntent object
 */
const retrieveSetupIntent = async (setupIntentId) => {
    try {
        return await stripe.setupIntents.retrieve(setupIntentId);
    } catch (error) {
        console.error('Stripe retrieve setup intent error:', error);
        throw error;
    }
};

/**
 * Create a PaymentIntent for charging a saved payment method
 * @param {Object} params - PaymentIntent parameters
 * @param {number} params.amount - Amount in cents
 * @param {string} params.currency - Currency code (e.g., 'cad')
 * @param {string} params.customerId - Stripe customer ID
 * @param {string} params.paymentMethodId - Saved payment method ID
 * @param {Object} params.metadata - Optional metadata
 * @param {boolean} params.confirm - Whether to confirm immediately
 * @returns {Promise<Object>} Stripe PaymentIntent object
 */
const createPaymentIntent = async ({
    amount,
    currency = 'cad',
    customerId,
    paymentMethodId,
    metadata = {},
    confirm = true
}) => {
    try {
        return await stripe.paymentIntents.create({
            amount,
            currency: currency.toLowerCase(),
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm,
            metadata
        });
    } catch (error) {
        console.error('Stripe create payment intent error:', error);
        throw error;
    }
};

/**
 * Retrieve a PaymentIntent
 * @param {string} paymentIntentId - PaymentIntent ID
 * @returns {Promise<Object>} Stripe PaymentIntent object
 */
const retrievePaymentIntent = async (paymentIntentId) => {
    try {
        return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
        console.error('Stripe retrieve payment intent error:', error);
        throw error;
    }
};

/**
 * Confirm a PaymentIntent (for action_required cases)
 * @param {string} paymentIntentId - PaymentIntent ID
 * @returns {Promise<Object>} Stripe PaymentIntent object
 */
const confirmPaymentIntent = async (paymentIntentId) => {
    try {
        return await stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
        console.error('Stripe confirm payment intent error:', error);
        throw error;
    }
};

module.exports = {
    createOrRetrieveCustomer,
    createSetupIntent,
    retrieveSetupIntent,
    createPaymentIntent,
    retrievePaymentIntent,
    confirmPaymentIntent,
    stripe // Export stripe instance for direct use if needed
};
