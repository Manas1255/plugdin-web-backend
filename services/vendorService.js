const userRepository = require('../repositories/userRepository');
const { calculatePagination } = require('../utils/paginationHelper');

/**
 * Get paginated list of registered vendors
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<{success: boolean, statusCode: number, data?: object, errorKey?: string, error?: string}>}
 */
const getVendors = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const vendors = await userRepository.findVendorsPaginated(limit, skip);
        const total = await userRepository.countVendors();

        const pagination = calculatePagination(total, page, limit);

        return {
            success: true,
            statusCode: 200,
            data: {
                vendors,
                pagination
            }
        };
    } catch (error) {
        console.error('Get vendors error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

module.exports = {
    getVendors
};
