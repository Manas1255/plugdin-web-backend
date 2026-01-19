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

module.exports = {
    findByEmail,
    create,
    findById
};
