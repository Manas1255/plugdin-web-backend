const mongoose = require('mongoose');
const VendorApplication = require('../models/VendorApplication');

const findByEmail = async (email) => {
    return await VendorApplication.findOne({ email: email.toLowerCase().trim() });
};

const findByEmailWithToken = async (email) => {
    return await VendorApplication.findOne({ email: email.toLowerCase().trim() })
        .select('+approvalToken +approvalTokenExpiry');
};

const findById = async (applicationId) => {
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return null;
    }
    return await VendorApplication.findById(applicationId);
};

const findByIdWithToken = async (applicationId) => {
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return null;
    }
    return await VendorApplication.findById(applicationId)
        .select('+approvalToken +approvalTokenExpiry');
};

const findByIdWithPasswordHash = async (applicationId) => {
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return null;
    }
    return await VendorApplication.findById(applicationId)
        .select('+passwordHash');
};

const create = async (applicationData) => {
    const application = new VendorApplication(applicationData);
    return await application.save();
};

const updateById = async (applicationId, updateData) => {
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return null;
    }
    return await VendorApplication.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true, runValidators: true }
    );
};

const findPaginated = async (filter = {}, page = 1, limit = 20, sort = { createdAt: -1 }) => {
    const skip = (page - 1) * limit;
    
    const applications = await VendorApplication.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('reviewedByAdminId', 'firstName lastName email');
    
    const totalCount = await VendorApplication.countDocuments(filter);
    
    return {
        applications,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            limit
        }
    };
};

const countByStatus = async (status) => {
    return await VendorApplication.countDocuments({ status });
};

const deleteById = async (applicationId) => {
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
        return null;
    }
    return await VendorApplication.findByIdAndDelete(applicationId);
};

module.exports = {
    findByEmail,
    findByEmailWithToken,
    findById,
    findByIdWithToken,
    findByIdWithPasswordHash,
    create,
    updateById,
    findPaginated,
    countByStatus,
    deleteById
};
