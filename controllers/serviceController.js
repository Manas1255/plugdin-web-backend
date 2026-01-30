const serviceService = require('../services/serviceService');
const { sendResponse } = require('../utils/responseHelper');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');
const { getPaginationParams } = require('../utils/paginationHelper');
const { uploadToS3 } = require('../utils/s3Client');
const mongoose = require('mongoose');

/**
 * Create a new service
 * Requires multipart/form-data with file uploads for photos
 */
const createService = async (req, res) => {
    try {
        const vendorId = req.user._id;
        let serviceData = req.body;

        // Parse JSON fields that might be sent as strings in multipart/form-data
        // Multer parses form fields as strings, so we need to parse JSON fields
        const jsonFields = ['availability', 'pricingOptions'];
        jsonFields.forEach(field => {
            if (serviceData[field] && typeof serviceData[field] === 'string') {
                try {
                    serviceData[field] = JSON.parse(serviceData[field]);
                } catch (e) {
                    // If parsing fails, keep the original value
                }
            }
        });

        // Handle array fields that might be sent as comma-separated strings
        const arrayFields = ['servicingArea', 'packageSpecifications'];
        arrayFields.forEach(field => {
            if (serviceData[field]) {
                if (typeof serviceData[field] === 'string') {
                    try {
                        // Try to parse as JSON first
                        serviceData[field] = JSON.parse(serviceData[field]);
                    } catch (e) {
                        // If JSON parsing fails, treat as comma-separated string
                        serviceData[field] = serviceData[field]
                            .split(',')
                            .map(item => item.trim())
                            .filter(item => item.length > 0);
                    }
                }
                // Ensure it's an array
                if (!Array.isArray(serviceData[field])) {
                    serviceData[field] = [serviceData[field]];
                }
            }
        });

        // Parse numeric fields
        if (serviceData.pricePerHour && typeof serviceData.pricePerHour === 'string') {
            serviceData.pricePerHour = parseFloat(serviceData.pricePerHour);
        }

        // Require file uploads for photos
        if (!req.files || req.files.length === 0) {
            return sendResponse(res, 400, null, {
                message: getErrorMessage('PHOTOS_REQUIRED', errorMessages)
            });
        }

        // Validate file count
        if (req.files.length > 10) {
            return sendResponse(res, 400, null, {
                message: getErrorMessage('MAX_IMAGES_EXCEEDED', errorMessages)
            });
        }

        // Generate serviceId first (needed for S3 folder structure)
        const serviceId = new mongoose.Types.ObjectId();
        const photoUrls = [];

        // Upload all files to S3
        try {
            for (const file of req.files) {
                const folder = `services/${serviceId}`;
                const url = await uploadToS3(
                    file.buffer,
                    file.originalname,
                    file.mimetype,
                    folder
                );
                photoUrls.push(url);
            }
        } catch (uploadError) {
            console.error('S3 upload error:', uploadError);
            return sendResponse(res, 500, null, {
                message: getErrorMessage('S3_UPLOAD_ERROR', errorMessages)
            });
        }

        // Add photo URLs to service data
        serviceData.photos = photoUrls;

        // Create service (serviceService will handle validation and creation)
        // Pass the pre-generated serviceId for S3 folder organization
        const result = await serviceService.createService(vendorId, serviceData, serviceId);

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
 * Get vendor's services (authenticated vendor - own services)
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
 * Get services by vendor ID (vendor id in request body, same response format as getVendorServices)
 */
const getServicesByVendorId = async (req, res) => {
    try {
        const { vendorId } = req.body;
        const { status } = req.query;
        const { page, limit } = getPaginationParams(req);

        if (!vendorId) {
            return sendResponse(res, 400, null, {
                message: getErrorMessage('VENDOR_ID_REQUIRED', errorMessages)
            });
        }

        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return sendResponse(res, 400, null, {
                message: getErrorMessage('INVALID_VENDOR_ID', errorMessages)
            });
        }

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
        console.error('Get services by vendor ID controller error:', error);
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
    getServicesByVendorId,
    updateService,
    deleteService,
    searchServices
};
