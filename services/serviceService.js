const serviceRepository = require('../repositories/serviceRepository');
const categoryRepository = require('../repositories/categoryRepository');
const cityRepository = require('../repositories/cityRepository');

/**
 * Validate availability schedule
 */
const validateAvailability = (availability) => {
    const errors = [];

    if (!availability.timezone || typeof availability.timezone !== 'string') {
        errors.push('Timezone is required');
    }

    if (!availability.weeklySchedule || !Array.isArray(availability.weeklySchedule)) {
        return {
            isValid: false,
            errorKey: 'INVALID_AVAILABILITY_FORMAT',
            errors: ['Weekly schedule must be an array']
        };
    }

    const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const seenDays = new Set();

    for (const daySchedule of availability.weeklySchedule) {
        // Validate day of week
        if (!daySchedule.dayOfWeek || !validDays.includes(daySchedule.dayOfWeek.toLowerCase())) {
            errors.push(`Invalid day of week: ${daySchedule.dayOfWeek}`);
            continue;
        }

        const day = daySchedule.dayOfWeek.toLowerCase();

        // Check for duplicate days
        if (seenDays.has(day)) {
            errors.push(`Duplicate day in schedule: ${daySchedule.dayOfWeek}`);
            continue;
        }
        seenDays.add(day);

        // If day is marked as available, validate time slots
        if (daySchedule.isAvailable) {
            if (!daySchedule.timeSlots || !Array.isArray(daySchedule.timeSlots)) {
                errors.push(`Time slots required for ${daySchedule.dayOfWeek} when marked as available`);
                continue;
            }

            if (daySchedule.timeSlots.length === 0) {
                errors.push(`At least one time slot required for ${daySchedule.dayOfWeek} when marked as available`);
                continue;
            }

            // Validate each time slot
            for (let i = 0; i < daySchedule.timeSlots.length; i++) {
                const slot = daySchedule.timeSlots[i];
                
                // Validate time format (HH:MM)
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                
                if (!slot.startTime || !timeRegex.test(slot.startTime)) {
                    errors.push(`Invalid start time format for ${daySchedule.dayOfWeek} slot ${i + 1}. Expected HH:MM format`);
                }

                if (!slot.endTime || !timeRegex.test(slot.endTime)) {
                    errors.push(`Invalid end time format for ${daySchedule.dayOfWeek} slot ${i + 1}. Expected HH:MM format`);
                }

                // Validate start time is before end time
                if (slot.startTime && slot.endTime) {
                    const [startHour, startMin] = slot.startTime.split(':').map(Number);
                    const [endHour, endMin] = slot.endTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;

                    if (startMinutes >= endMinutes) {
                        errors.push(`Start time must be before end time for ${daySchedule.dayOfWeek} slot ${i + 1}`);
                    }
                }
            }
        }
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            errorKey: 'INVALID_AVAILABILITY',
            errors
        };
    }

    return { isValid: true };
};

/**
 * Create a new service
 */
const createService = async (vendorId, serviceData) => {
    try {
        // Validate category exists
        const category = await categoryRepository.findByName(serviceData.category);
        if (!category) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_CATEGORY'
            };
        }

        // Validate servicing areas exist
        if (serviceData.servicingArea && serviceData.servicingArea.length > 0) {
            const cities = await cityRepository.findAll();
            const cityNames = cities.map(city => city.name.toLowerCase());
            
            const invalidAreas = serviceData.servicingArea.filter(
                area => !cityNames.includes(area.toLowerCase())
            );
            
            if (invalidAreas.length > 0) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'INVALID_SERVICING_AREA',
                    data: { invalidAreas }
                };
            }
        }

        // Check if service with same title already exists for this vendor
        const existingService = await serviceRepository.existsByTitleAndVendor(
            serviceData.listingTitle,
            vendorId
        );

        if (existingService) {
            return {
                success: false,
                statusCode: 409,
                errorKey: 'SERVICE_ALREADY_EXISTS'
            };
        }

        // Validate pricing based on listing type
        if (serviceData.listingType === 'hourly') {
            if (!serviceData.pricePerHour || serviceData.pricePerHour <= 0) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'INVALID_HOURLY_PRICE'
                };
            }

            if (!serviceData.bookingStartInterval) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'BOOKING_INTERVAL_REQUIRED'
                };
            }

            // Remove pricing options for hourly booking
            delete serviceData.pricingOptions;
        } else if (serviceData.listingType === 'fixed') {
            if (!serviceData.pricingOptions || serviceData.pricingOptions.length === 0) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'PRICING_OPTIONS_REQUIRED'
                };
            }

            // Validate each pricing option
            for (const option of serviceData.pricingOptions) {
                if (!option.name || !option.pricePerSession || option.pricePerSession <= 0) {
                    return {
                        success: false,
                        statusCode: 400,
                        errorKey: 'INVALID_PRICING_OPTION'
                    };
                }

                if (!option.sessionLength || 
                    (option.sessionLength.hours === 0 && option.sessionLength.minutes === 0)) {
                    return {
                        success: false,
                        statusCode: 400,
                        errorKey: 'INVALID_SESSION_LENGTH'
                    };
                }
            }

            // Remove hourly fields for fixed booking
            delete serviceData.pricePerHour;
            delete serviceData.bookingStartInterval;
        }

        // Validate availability
        if (serviceData.availability) {
            const availabilityValidation = validateAvailability(serviceData.availability);
            if (!availabilityValidation.isValid) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: availabilityValidation.errorKey,
                    data: { errors: availabilityValidation.errors }
                };
            }
        }

        // Validate photos
        if (serviceData.photos) {
            if (!Array.isArray(serviceData.photos)) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'INVALID_PHOTOS_FORMAT'
                };
            }

            if (serviceData.photos.length > 10) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'MAX_PHOTOS_EXCEEDED'
                };
            }

            // Validate photo URLs (basic validation)
            for (const photo of serviceData.photos) {
                if (typeof photo !== 'string' || photo.trim() === '') {
                    return {
                        success: false,
                        statusCode: 400,
                        errorKey: 'INVALID_PHOTO_URL'
                    };
                }
            }
        }

        // Create service
        const service = await serviceRepository.createService({
            ...serviceData,
            vendor: vendorId
        });

        return {
            success: true,
            statusCode: 201,
            data: {
                message: 'Service created successfully',
                service
            }
        };

    } catch (error) {
        console.error('Create service error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Get service by ID
 */
const getServiceById = async (serviceId) => {
    try {
        const service = await serviceRepository.findById(serviceId);

        if (!service) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'SERVICE_NOT_FOUND'
            };
        }

        return {
            success: true,
            statusCode: 200,
            data: { service }
        };

    } catch (error) {
        console.error('Get service error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Get vendor's services
 */
const getVendorServices = async (vendorId, filters = {}) => {
    try {
        const services = await serviceRepository.findByVendor(vendorId, filters);

        return {
            success: true,
            statusCode: 200,
            data: {
                count: services.length,
                services
            }
        };

    } catch (error) {
        console.error('Get vendor services error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Update service
 */
const updateService = async (serviceId, vendorId, updateData) => {
    try {
        // Check if service exists and belongs to vendor
        const service = await serviceRepository.findById(serviceId);

        if (!service) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'SERVICE_NOT_FOUND'
            };
        }

        if (service.vendor._id.toString() !== vendorId.toString()) {
            return {
                success: false,
                statusCode: 403,
                errorKey: 'FORBIDDEN'
            };
        }

        // If updating title, check for duplicates
        if (updateData.listingTitle && updateData.listingTitle !== service.listingTitle) {
            const existingService = await serviceRepository.existsByTitleAndVendor(
                updateData.listingTitle,
                vendorId,
                serviceId
            );

            if (existingService) {
                return {
                    success: false,
                    statusCode: 409,
                    errorKey: 'SERVICE_ALREADY_EXISTS'
                };
            }
        }

        // Update service
        const updatedService = await serviceRepository.updateById(serviceId, updateData);

        return {
            success: true,
            statusCode: 200,
            data: {
                message: 'Service updated successfully',
                service: updatedService
            }
        };

    } catch (error) {
        console.error('Update service error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Delete service
 */
const deleteService = async (serviceId, vendorId) => {
    try {
        const service = await serviceRepository.findById(serviceId);

        if (!service) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'SERVICE_NOT_FOUND'
            };
        }

        if (service.vendor._id.toString() !== vendorId.toString()) {
            return {
                success: false,
                statusCode: 403,
                errorKey: 'FORBIDDEN'
            };
        }

        await serviceRepository.softDeleteById(serviceId);

        return {
            success: true,
            statusCode: 200,
            data: {
                message: 'Service deleted successfully'
            }
        };

    } catch (error) {
        console.error('Delete service error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Search services
 */
const searchServices = async (filters = {}, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const services = await serviceRepository.findAll(filters, limit, skip);
        const total = await serviceRepository.count(filters);

        return {
            success: true,
            statusCode: 200,
            data: {
                services,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }
        };

    } catch (error) {
        console.error('Search services error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

module.exports = {
    createService,
    getServiceById,
    getVendorServices,
    updateService,
    deleteService,
    searchServices
};
