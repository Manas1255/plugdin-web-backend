const serviceService = require('../services/serviceService');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');
const { getPaginationParams } = require('../utils/paginationHelper');

/**
 * Create a new service
 */
const createService = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const serviceData = req.body;

        const result = await serviceService.createService(vendorId, serviceData);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Create service controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Get service by ID
 */
const getService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        const result = await serviceService.getServiceById(serviceId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get service controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Get vendor's services
 */
const getVendorServices = async (req, res) => {
    try {
        const vendorId = req.user._id;
        const { status } = req.query;
        const { page, limit } = getPaginationParams(req);

        const filters = {};
        if (status) {
            filters.status = status;
        }

        const result = await serviceService.getVendorServices(vendorId, filters, page, limit);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Get vendor services controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Update service
 */
const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const vendorId = req.user._id;
        const updateData = req.body;

        const result = await serviceService.updateService(serviceId, vendorId, updateData);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Update service controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Delete service
 */
const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const vendorId = req.user._id;

        const result = await serviceService.deleteService(serviceId, vendorId);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Delete service controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

/**
 * Search services
 */
const searchServices = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, startDate, endDate } = req.query;
        const { page, limit } = getPaginationParams(req);

        const filters = {};
        if (category) filters.category = category;
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        
        const result = await serviceService.searchServices(filters, page, limit);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);

    } catch (error) {
        console.error('Search services controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

module.exports = {
    createService,
    getService,
    getVendorServices,
    updateService,
    deleteService,
    searchServices
};
