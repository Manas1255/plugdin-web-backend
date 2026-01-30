const vendorService = require('../services/vendorService');
const { sendResponse } = require('../utils/responseHelper');
const { getPaginationParams } = require('../utils/paginationHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

/**
 * Get paginated list of all registered vendors
 * Returns only id, firstName, lastName, profilePicture
 */
const getVendors = async (req, res) => {
    try {
        const { page, limit } = getPaginationParams(req);

        const result = await vendorService.getVendors(page, limit);

        if (!result.success) {
            return sendResponse(res, result.statusCode, null, {
                message: getErrorMessage(result.errorKey, errorMessages)
            });
        }

        return sendResponse(res, result.statusCode, result.data, null);
    } catch (error) {
        console.error('Get vendors controller error:', error);
        return sendResponse(res, 500, null, {
            message: getErrorMessage('INTERNAL_SERVER_ERROR', errorMessages)
        });
    }
};

module.exports = {
    getVendors
};
