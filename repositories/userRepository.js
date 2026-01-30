const mongoose = require('mongoose');
const User = require('../models/User');

const findByEmail = async (email) => {
    return await User.findOne({ email: email.toLowerCase().trim() });
};

const create = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

const findById = async (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    return await User.findById(userId);
};

const findByEmailWithPassword = async (email) => {
    return await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

const updateById = async (userId, updateData) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    return await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );
};

const deleteById = async (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    return await User.findByIdAndDelete(userId);
};

const findByIdWithPassword = async (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    return await User.findById(userId).select('+password');
};

const findVendorsPaginated = async (limit = 10, skip = 0) => {
    return await User.find({ role: 'vendor' })
        .select('firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

const countVendors = async () => {
    return await User.countDocuments({ role: 'vendor' });
};

const updatePassword = async (userId, newPassword) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    const user = await User.findById(userId);
    if (!user) {
        return null;
    }
    
    // Update password and save (this will trigger the pre-save hook to hash the password)
    user.password = newPassword;
    return await user.save();
};

module.exports = {
    findByEmail,
    create,
    findById,
    findByEmailWithPassword,
    updateById,
    deleteById,
    findByIdWithPassword,
    updatePassword,
    findVendorsPaginated,
    countVendors
};
