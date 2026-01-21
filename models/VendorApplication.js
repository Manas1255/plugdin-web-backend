const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const vendorApplicationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required'],
        select: false // Don't include password hash in queries by default
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    bio: {
        type: String,
        required: [true, 'Bio is required'],
        trim: true,
        maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    instagramHandle: {
        type: String,
        default: null,
        trim: true,
        maxlength: [50, 'Instagram handle cannot exceed 50 characters']
    },
    websiteOrPortfolioLink: {
        type: String,
        default: null,
        trim: true,
        maxlength: [200, 'Website URL cannot exceed 200 characters']
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        trim: true,
        maxlength: [100, 'Service type cannot exceed 100 characters']
    },
    typicalResponseTimeToInquiries: {
        type: String,
        required: [true, 'Typical response time to inquiries is required'],
        trim: true,
        maxlength: [100, 'Response time cannot exceed 100 characters']
    },
    bookingAdvanceAndComfortWithWindow: {
        type: String,
        required: [true, 'Booking advance and comfort with window is required'],
        trim: true,
        maxlength: [500, 'Booking advance information cannot exceed 500 characters']
    },
    hasBackupEquipment: {
        type: Boolean,
        required: [true, 'Backup equipment information is required']
    },
    hasStandardServiceAgreement: {
        type: Boolean,
        required: [true, 'Standard service agreement information is required']
    },
    additionalBusinessNotes: {
        type: String,
        default: null,
        trim: true,
        maxlength: [1000, 'Additional business notes cannot exceed 1000 characters']
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['pending', 'approved', 'rejected'],
            message: 'Status must be either "pending", "approved", or "rejected"'
        },
        default: 'pending'
    },
    reviewedByAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    approvalToken: {
        type: String,
        default: null,
        select: false // Don't include token in queries by default
    },
    approvalTokenExpiry: {
        type: Date,
        default: null,
        select: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for faster lookups
// Note: email index is automatically created by unique: true, so we don't need to define it explicitly
vendorApplicationSchema.index({ status: 1 });
vendorApplicationSchema.index({ createdAt: -1 });

// Virtual for full name
vendorApplicationSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
vendorApplicationSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.passwordHash;
        delete ret.approvalToken;
        delete ret.approvalTokenExpiry;
        delete ret.__v;
        return ret;
    }
});

const VendorApplication = mongoose.model('VendorApplication', vendorApplicationSchema);

module.exports = VendorApplication;
