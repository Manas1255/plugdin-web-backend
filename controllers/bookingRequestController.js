const bookingRequestService = require('../services/bookingRequestService');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

/**
 * Create a new booking request
 */
const createBookingRequest = async (req, res) => {
    try {
        const clientId = req.user._id;
        const bookingData = req.body;

        const result = await bookingRequestService.createBookingRequest(clientId, bookingData);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages),
                ...(result.data && { data: result.data })
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Create booking request controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Complete payment method setup
 */
const completePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user._id;
        const { setupIntentId } = req.body;

        if (!setupIntentId) {
            return sendResponse(res, 400, null, {
                message: 'Setup intent ID is required'
            });
        }

        const result = await bookingRequestService.completePaymentMethod(id, clientId, setupIntentId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages),
                ...(result.data && { data: result.data })
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Complete payment method controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Vendor accepts booking request
 */
const acceptBookingRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        const result = await bookingRequestService.acceptBookingRequest(id, vendorId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages),
                ...(result.error && { error: result.error }),
                ...(result.data && { data: result.data })
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Accept booking request controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Vendor rejects booking request
 */
const rejectBookingRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;
        const { rejectionReason } = req.body;

        const result = await bookingRequestService.rejectBookingRequest(id, vendorId, rejectionReason);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages),
                ...(result.data && { data: result.data })
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Reject booking request controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Get booking request by ID
 */
const getBookingRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const result = await bookingRequestService.getBookingRequestById(id, userId, userRole);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get booking request controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Get client's booking requests
 */
const getClientBookingRequests = async (req, res) => {
    try {
        const clientId = req.user._id;
        const { status } = req.query;

        const filters = {};
        if (status) {
            filters.status = status;
        }

        const result = await bookingRequestService.getClientBookingRequests(clientId, filters);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get client booking requests controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Get vendor's booking requests
 */
const getVendorBookingRequests = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const { status } = req.query;

        const filters = {};
        if (status) {
            filters.status = status;
        }

        const result = await bookingRequestService.getVendorBookingRequests(vendorId, filters);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get vendor booking requests controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

module.exports = {
    createBookingRequest,
    completePaymentMethod,
    acceptBookingRequest,
    rejectBookingRequest,
    getBookingRequest,
    getClientBookingRequests,
    getVendorBookingRequests
};
