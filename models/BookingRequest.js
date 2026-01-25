const mongoose = require('mongoose');

const pricingSnapshotSchema = new mongoose.Schema({
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    platformFee: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'cad',
        uppercase: true
    }
}, { _id: false });

const bookingRequestSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service ID is required']
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vendor ID is required']
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client ID is required']
    },
    bookingStart: {
        type: Date,
        required: [true, 'Booking start time is required']
    },
    bookingEnd: {
        type: Date,
        required: [true, 'Booking end time is required']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    pricingSnapshot: {
        type: pricingSnapshotSchema,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['payment_pending', 'pending_vendor', 'accepted', 'rejected', 'paid', 'payment_failed', 'action_required'],
            message: 'Invalid booking status'
        },
        default: 'payment_pending'
    },
    stripeCustomerId: {
        type: String,
        trim: true
    },
    stripeSetupIntentId: {
        type: String,
        trim: true
    },
    stripePaymentMethodId: {
        type: String,
        trim: true
    },
    stripePaymentIntentId: {
        type: String,
        trim: true
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
bookingRequestSchema.index({ serviceId: 1 });
bookingRequestSchema.index({ vendorId: 1 });
bookingRequestSchema.index({ clientId: 1 });
bookingRequestSchema.index({ status: 1 });
bookingRequestSchema.index({ bookingStart: 1, bookingEnd: 1 });
bookingRequestSchema.index({ stripeSetupIntentId: 1 });
bookingRequestSchema.index({ stripePaymentIntentId: 1 });

// Compound index for checking booking conflicts
bookingRequestSchema.index({ 
    serviceId: 1, 
    bookingStart: 1, 
    bookingEnd: 1,
    status: 1
});

// Virtual to check if booking is in a paid/completed state
bookingRequestSchema.virtual('isCompleted').get(function() {
    return ['paid', 'accepted'].includes(this.status);
});

// Virtual to check if booking is in a pending state
bookingRequestSchema.virtual('isPending').get(function() {
    return ['payment_pending', 'pending_vendor', 'action_required'].includes(this.status);
});

// Ensure virtual fields are serialized
bookingRequestSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        return ret;
    }
});

const BookingRequest = mongoose.model('BookingRequest', bookingRequestSchema);

module.exports = BookingRequest;
