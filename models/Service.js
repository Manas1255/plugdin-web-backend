const mongoose = require('mongoose');

const pricingOptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pricing option name is required'],
        trim: true
    },
    pricePerSession: {
        type: Number,
        required: [true, 'Price per session is required'],
        min: [0, 'Price cannot be negative']
    },
    sessionLength: {
        hours: {
            type: Number,
            required: [true, 'Session hours is required'],
            min: [0, 'Hours cannot be negative']
        },
        minutes: {
            type: Number,
            required: [true, 'Session minutes is required'],
            min: [0, 'Minutes cannot be negative'],
            max: [59, 'Minutes cannot exceed 59']
        }
    }
}, { _id: true });

const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        trim: true,
        validate: {
            validator: function(v) {
                // Validate HH:MM format (24-hour)
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Start time must be in HH:MM format (e.g., 09:00)'
        }
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        trim: true,
        validate: {
            validator: function(v) {
                // Validate HH:MM format (24-hour)
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'End time must be in HH:MM format (e.g., 17:00)'
        }
    }
}, { _id: true });

const dailyScheduleSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        required: [true, 'Day of week is required'],
        enum: {
            values: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            message: 'Invalid day of week'
        }
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    timeSlots: {
        type: [timeSlotSchema],
        default: []
    }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vendor is required']
    },
    listingType: {
        type: String,
        required: [true, 'Listing type is required'],
        enum: {
            values: ['hourly', 'fixed'],
            message: 'Listing type must be either "hourly" or "fixed"'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    listingTitle: {
        type: String,
        required: [true, 'Listing title is required'],
        trim: true,
        maxlength: [200, 'Listing title cannot exceed 200 characters']
    },
    listingDescription: {
        type: String,
        required: [true, 'Listing description is required'],
        trim: true,
        maxlength: [2000, 'Listing description cannot exceed 2000 characters']
    },
    packageSpecifications: {
        type: [String],
        default: []
    },
    servicingArea: {
        type: [String],
        required: [true, 'At least one servicing area is required'],
        validate: {
            validator: function(arr) {
                return arr && arr.length > 0;
            },
            message: 'At least one servicing area must be selected'
        }
    },
    // For hourly booking
    pricePerHour: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        required: function() {
            return this.listingType === 'hourly';
        }
    },
    // For fixed/session booking
    pricingOptions: {
        type: [pricingOptionSchema],
        validate: {
            validator: function(arr) {
                if (this.listingType === 'fixed') {
                    return arr && arr.length > 0;
                }
                return true;
            },
            message: 'At least one pricing option is required for fixed booking'
        }
    },
    bookingStartInterval: {
        type: String,
        enum: {
            values: ['every_hour', 'every_half_hour', 'every_quarter_hour'],
            message: 'Invalid booking start interval'
        },
        required: function() {
            return this.listingType === 'hourly';
        }
    },
    availability: {
        timezone: {
            type: String,
            required: [true, 'Timezone is required'],
            trim: true,
            default: 'America/Toronto'
        },
        weeklySchedule: {
            type: [dailyScheduleSchema],
            default: []
        }
    },
    photos: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 10;
            },
            message: 'Maximum 10 photos allowed'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'active', 'inactive', 'archived'],
            message: 'Invalid status'
        },
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
serviceSchema.index({ vendor: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ servicingArea: 1 });

// Virtual for total session time in minutes
pricingOptionSchema.virtual('totalMinutes').get(function() {
    return (this.sessionLength.hours * 60) + this.sessionLength.minutes;
});

// Ensure virtual fields are serialized
serviceSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        return ret;
    }
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
