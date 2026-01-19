const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'City name is required'],
        trim: true
    },
    province: {
        type: String,
        required: [true, 'Province is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'Canada'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index
citySchema.index({ name: 1, province: 1 });

const City = mongoose.model('City', citySchema);

module.exports = City;
