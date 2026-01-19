const City = require('../models/City');

/**
 * Find all active cities
 */
const findAll = async (filters = {}) => {
    const query = { isActive: true, ...filters };
    return await City.find(query).sort({ name: 1 });
};

/**
 * Find cities by province
 */
const findByProvince = async (province) => {
    return await City.find({ 
        province: { $regex: new RegExp(`^${province}$`, 'i') },
        isActive: true 
    }).sort({ name: 1 });
};

/**
 * Find city by name
 */
const findByName = async (name, province = null) => {
    const query = {
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        isActive: true
    };
    
    if (province) {
        query.province = { $regex: new RegExp(`^${province}$`, 'i') };
    }
    
    return await City.findOne(query);
};

/**
 * Create a new city
 */
const createCity = async (cityData) => {
    const city = new City(cityData);
    return await city.save();
};

/**
 * Bulk create cities
 */
const bulkCreateCities = async (citiesData) => {
    return await City.insertMany(citiesData);
};

module.exports = {
    findAll,
    findByProvince,
    findByName,
    createCity,
    bulkCreateCities
};
