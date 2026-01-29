const mongoose = require('mongoose');
const Category = require('../models/Category');

/**
 * Find category by slug
 */
const findBySlug = async (slug) => {
    return await Category.findOne({ slug, isActive: true });
};

/**
 * Find category by name
 */
const findByName = async (name) => {
    return await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        isActive: true 
    });
};

/**
 * Find all active categories
 */
const findAll = async () => {
    return await Category.find({ isActive: true }).sort({ name: 1 });
};

/**
 * Create a new category
 */
const createCategory = async (categoryData) => {
    const category = new Category(categoryData);
    return await category.save();
};

/**
 * Find category by ID
 */
const findById = async (categoryId) => {
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return null;
    }
    return await Category.findOne({ _id: categoryId, isActive: true });
};

module.exports = {
    findBySlug,
    findByName,
    findAll,
    createCategory,
    findById
};
