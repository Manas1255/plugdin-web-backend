const categoryRepository = require('../repositories/categoryRepository');

/**
 * Get all categories
 */
const getAllCategories = async () => {
    try {
        const categories = await categoryRepository.findAll();

        return {
            success: true,
            statusCode: 200,
            data: {
                count: categories.length,
                categories
            }
        };

    } catch (error) {
        console.error('Get categories error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Get category package specifications
 */
const getCategorySpecifications = async (categorySlug) => {
    try {
        const category = await categoryRepository.findBySlug(categorySlug);

        if (!category) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'CATEGORY_NOT_FOUND'
            };
        }

        return {
            success: true,
            statusCode: 200,
            data: {
                category: category.name,
                slug: category.slug,
                packageSpecifications: category.packageSpecifications
            }
        };

    } catch (error) {
        console.error('Get category specifications error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

module.exports = {
    getAllCategories,
    getCategorySpecifications
};
