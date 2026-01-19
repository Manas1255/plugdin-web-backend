const User = require('../models/User');

const findByEmail = async (email) => {
    return await User.findOne({ email: email.toLowerCase().trim() });
};

const create = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

const findById = async (userId) => {
    return await User.findById(userId);
};

const findByEmailWithPassword = async (email) => {
    return await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

const updateById = async (userId, updateData) => {
    return await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    );
};

const deleteById = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

module.exports = {
    findByEmail,
    create,
    findById,
    findByEmailWithPassword,
    updateById,
    deleteById
};
