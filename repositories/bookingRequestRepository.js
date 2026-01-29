const mongoose = require('mongoose');
const BookingRequest = require('../models/BookingRequest');

/**
 * Create a new booking request
 */
const create = async (bookingData) => {
    const bookingRequest = new BookingRequest(bookingData);
    return await bookingRequest.save();
};

/**
 * Find booking request by ID
 */
const findById = async (bookingRequestId) => {
    if (!bookingRequestId || !mongoose.Types.ObjectId.isValid(bookingRequestId)) {
        return null;
    }
    return await BookingRequest.findById(bookingRequestId)
        .populate('serviceId', 'listingTitle listingType pricePerHour pricingOptions availability')
        .populate('vendorId', 'firstName lastName email profilePicture')
        .populate('clientId', 'firstName lastName email profilePicture');
};

/**
 * Find booking request by ID without population (for performance)
 */
const findByIdLean = async (bookingRequestId) => {
    if (!bookingRequestId || !mongoose.Types.ObjectId.isValid(bookingRequestId)) {
        return null;
    }
    return await BookingRequest.findById(bookingRequestId).lean();
};

/**
 * Find booking request by SetupIntent ID
 */
const findBySetupIntentId = async (setupIntentId) => {
    return await BookingRequest.findOne({ stripeSetupIntentId: setupIntentId });
};

/**
 * Find booking request by PaymentIntent ID
 */
const findByPaymentIntentId = async (paymentIntentId) => {
    return await BookingRequest.findOne({ stripePaymentIntentId: paymentIntentId });
};

/**
 * Find booking requests by client ID
 */
const findByClientId = async (clientId, filters = {}) => {
    const query = { clientId, ...filters };
    return await BookingRequest.find(query)
        .populate('serviceId', 'listingTitle listingType')
        .populate('vendorId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 });
};

/**
 * Find booking requests by vendor ID
 */
const findByVendorId = async (vendorId, filters = {}) => {
    const query = { vendorId, ...filters };
    return await BookingRequest.find(query)
        .populate('serviceId', 'listingTitle listingType')
        .populate('clientId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 });
};

/**
 * Update booking request by ID
 */
const updateById = async (bookingRequestId, updateData) => {
    if (!bookingRequestId || !mongoose.Types.ObjectId.isValid(bookingRequestId)) {
        return null;
    }
    return await BookingRequest.findByIdAndUpdate(
        bookingRequestId,
        updateData,
        { new: true, runValidators: true }
    )
        .populate('serviceId', 'listingTitle listingType')
        .populate('vendorId', 'firstName lastName email profilePicture')
        .populate('clientId', 'firstName lastName email profilePicture');
};

/**
 * Find existing payment_pending booking for same client, service, and overlapping time.
 * Used to support idempotent create (e.g. double-submit returns existing booking).
 */
const findPaymentPendingByClientServiceAndSlot = async (clientId, serviceId, bookingStart, bookingEnd) => {
    const query = {
        clientId,
        serviceId,
        status: 'payment_pending',
        $or: [
            { bookingStart: { $lte: bookingStart }, bookingEnd: { $gt: bookingStart } },
            { bookingStart: { $lt: bookingEnd }, bookingEnd: { $gte: bookingEnd } },
            { bookingStart: { $gte: bookingStart }, bookingEnd: { $lte: bookingEnd } }
        ]
    };
    return await BookingRequest.findOne(query)
        .populate('serviceId', 'listingTitle listingType pricePerHour pricingOptions availability')
        .populate('vendorId', 'firstName lastName email profilePicture')
        .populate('clientId', 'firstName lastName email profilePicture');
};

/**
 * Check for booking conflicts (overlapping bookings for the same service)
 * Returns true if there's a conflict, false otherwise
 */
const hasBookingConflict = async (serviceId, bookingStart, bookingEnd, excludeBookingId = null) => {
    const query = {
        serviceId,
        status: { $in: ['payment_pending', 'pending_vendor', 'accepted', 'paid'] },
        $or: [
            // New booking starts during existing booking
            {
                bookingStart: { $lte: bookingStart },
                bookingEnd: { $gt: bookingStart }
            },
            // New booking ends during existing booking
            {
                bookingStart: { $lt: bookingEnd },
                bookingEnd: { $gte: bookingEnd }
            },
            // New booking completely contains existing booking
            {
                bookingStart: { $gte: bookingStart },
                bookingEnd: { $lte: bookingEnd }
            }
        ]
    };

    if (excludeBookingId && mongoose.Types.ObjectId.isValid(excludeBookingId)) {
        query._id = { $ne: excludeBookingId };
    }

    const conflict = await BookingRequest.findOne(query);
    return !!conflict;
};

/**
 * Find all booking requests with filters
 */
const findAll = async (filters = {}, limit = 10, skip = 0) => {
    return await BookingRequest.find(filters)
        .populate('serviceId', 'listingTitle listingType')
        .populate('vendorId', 'firstName lastName email profilePicture')
        .populate('clientId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

/**
 * Count booking requests with filters
 */
const count = async (filters = {}) => {
    return await BookingRequest.countDocuments(filters);
};

module.exports = {
    create,
    findById,
    findByIdLean,
    findBySetupIntentId,
    findByPaymentIntentId,
    findByClientId,
    findByVendorId,
    updateById,
    findPaymentPendingByClientServiceAndSlot,
    hasBookingConflict,
    findAll,
    count
};
