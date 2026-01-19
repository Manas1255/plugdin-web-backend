const Service = require('../models/Service');

/**
 * Create a new service
 */
const createService = async (serviceData) => {
    const service = new Service(serviceData);
    return await service.save();
};

/**
 * Find service by ID
 */
const findById = async (serviceId) => {
    return await Service.findOne({ _id: serviceId, isDeleted: false })
        .populate('vendor', 'firstName lastName email profilePicture');
};

/**
 * Find services by vendor ID
 */
const findByVendor = async (vendorId, filters = {}) => {
    const query = { 
        vendor: vendorId, 
        isDeleted: false,
        ...filters
    };
    return await Service.find(query)
        .populate('vendor', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 });
};

/**
 * Find services by vendor ID with pagination
 */
const findByVendorPaginated = async (vendorId, filters = {}, limit = 10, skip = 0) => {
    const query = { 
        vendor: vendorId, 
        isDeleted: false,
        ...filters
    };
    return await Service.find(query)
        .populate('vendor', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

/**
 * Count services by vendor ID
 */
const countByVendor = async (vendorId, filters = {}) => {
    const query = { 
        vendor: vendorId, 
        isDeleted: false,
        ...filters
    };
    return await Service.countDocuments(query);
};

/**
 * Find all services with filters
 */
const findAll = async (filters = {}, limit = 10, skip = 0) => {
    const query = { isDeleted: false };
    
    // Extract special filters
    const { minPrice, maxPrice, availableDays, ...otherFilters } = filters;
    
    // Add other filters
    Object.assign(query, otherFilters);
    
    // Add price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
        const priceConditions = [];
        
        // Handle hourly services
        const hourlyCondition = { listingType: 'hourly' };
        if (minPrice !== undefined) hourlyCondition.pricePerHour = { $gte: minPrice };
        if (maxPrice !== undefined) {
            hourlyCondition.pricePerHour = hourlyCondition.pricePerHour || {};
            hourlyCondition.pricePerHour.$lte = maxPrice;
        }
        priceConditions.push(hourlyCondition);
        
        // Handle fixed services with pricing options
        const fixedCondition = { 
            listingType: 'fixed',
            pricingOptions: { $elemMatch: {} }
        };
        if (minPrice !== undefined) {
            fixedCondition.pricingOptions.$elemMatch.pricePerSession = { $gte: minPrice };
        }
        if (maxPrice !== undefined) {
            fixedCondition.pricingOptions.$elemMatch.pricePerSession = 
                fixedCondition.pricingOptions.$elemMatch.pricePerSession || {};
            fixedCondition.pricingOptions.$elemMatch.pricePerSession.$lte = maxPrice;
        }
        priceConditions.push(fixedCondition);
        
        query.$or = priceConditions;
    }
    
    // Add availability filtering by days of week
    if (availableDays && availableDays.length > 0) {
        query['availability.weeklySchedule'] = {
            $elemMatch: {
                dayOfWeek: { $in: availableDays },
                isAvailable: true
            }
        };
    }
    
    return await Service.find(query)
        .populate('vendor', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

/**
 * Count services with filters
 */
const count = async (filters = {}) => {
    const query = { isDeleted: false };
    
    // Extract special filters
    const { minPrice, maxPrice, availableDays, ...otherFilters } = filters;
    
    // Add other filters
    Object.assign(query, otherFilters);
    
    // Add price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
        const priceConditions = [];
        
        // Handle hourly services
        const hourlyCondition = { listingType: 'hourly' };
        if (minPrice !== undefined) hourlyCondition.pricePerHour = { $gte: minPrice };
        if (maxPrice !== undefined) {
            hourlyCondition.pricePerHour = hourlyCondition.pricePerHour || {};
            hourlyCondition.pricePerHour.$lte = maxPrice;
        }
        priceConditions.push(hourlyCondition);
        
        // Handle fixed services with pricing options
        const fixedCondition = { 
            listingType: 'fixed',
            pricingOptions: { $elemMatch: {} }
        };
        if (minPrice !== undefined) {
            fixedCondition.pricingOptions.$elemMatch.pricePerSession = { $gte: minPrice };
        }
        if (maxPrice !== undefined) {
            fixedCondition.pricingOptions.$elemMatch.pricePerSession = 
                fixedCondition.pricingOptions.$elemMatch.pricePerSession || {};
            fixedCondition.pricingOptions.$elemMatch.pricePerSession.$lte = maxPrice;
        }
        priceConditions.push(fixedCondition);
        
        query.$or = priceConditions;
    }
    
    // Add availability filtering by days of week
    if (availableDays && availableDays.length > 0) {
        query['availability.weeklySchedule'] = {
            $elemMatch: {
                dayOfWeek: { $in: availableDays },
                isAvailable: true
            }
        };
    }
    
    return await Service.countDocuments(query);
};

/**
 * Update service by ID
 */
const updateById = async (serviceId, updateData) => {
    return await Service.findOneAndUpdate(
        { _id: serviceId, isDeleted: false },
        updateData,
        { new: true, runValidators: true }
    ).populate('vendor', 'firstName lastName email profilePicture');
};

/**
 * Soft delete service by ID
 */
const softDeleteById = async (serviceId) => {
    return await Service.findOneAndUpdate(
        { _id: serviceId, isDeleted: false },
        { isDeleted: true, status: 'archived' },
        { new: true }
    );
};

/**
 * Check if service exists by title and vendor
 */
const existsByTitleAndVendor = async (listingTitle, vendorId, excludeId = null) => {
    const query = {
        listingTitle: { $regex: new RegExp(`^${listingTitle}$`, 'i') },
        vendor: vendorId,
        isDeleted: false
    };
    
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    
    const service = await Service.findOne(query);
    return !!service;
};

/**
 * Find services by category
 */
const findByCategory = async (category, limit = 10, skip = 0) => {
    return await Service.find({ 
        category, 
        isDeleted: false, 
        status: 'active' 
    })
        .populate('vendor', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

/**
 * Find services by servicing area
 */
const findByServicingArea = async (area, limit = 10, skip = 0) => {
    return await Service.find({ 
        servicingArea: area, 
        isDeleted: false, 
        status: 'active' 
    })
        .populate('vendor', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
};

module.exports = {
    createService,
    findById,
    findByVendor,
    findByVendorPaginated,
    countByVendor,
    findAll,
    count,
    updateById,
    softDeleteById,
    existsByTitleAndVendor,
    findByCategory,
    findByServicingArea
};
