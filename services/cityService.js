const cityRepository = require('../repositories/cityRepository');

/**
 * Get all cities
 */
const getAllCities = async (province = null) => {
    try {
        let cities;
        
        if (province) {
            cities = await cityRepository.findByProvince(province);
        } else {
            cities = await cityRepository.findAll();
        }

        return {
            success: true,
            statusCode: 200,
            data: {
                count: cities.length,
                cities
            }
        };

    } catch (error) {
        console.error('Get cities error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

module.exports = {
    getAllCities
};
