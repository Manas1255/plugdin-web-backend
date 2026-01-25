const bookingRequestRepository = require('../repositories/bookingRequestRepository');
const serviceRepository = require('../repositories/serviceRepository');
const userRepository = require('../repositories/userRepository');
const stripeClient = require('./stripeClient');

/**
 * Calculate platform fee (e.g., 5% of subtotal)
 */
const calculatePlatformFee = (subtotal) => {
    const platformFeePercentage = 0.05; // 5%
    return Math.round(subtotal * platformFeePercentage);
};

/**
 * Calculate tax (e.g., 13% HST for Ontario, Canada)
 */
const calculateTax = (subtotal, platformFee) => {
    const taxRate = 0.13; // 13% HST
    return Math.round((subtotal + platformFee) * taxRate);
};

/**
 * Calculate pricing for hourly booking
 */
const calculateHourlyPricing = (pricePerHour, bookingStart, bookingEnd) => {
    const startTime = new Date(bookingStart);
    const endTime = new Date(bookingEnd);
    
    // Calculate hours (including partial hours)
    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Round up to nearest 0.25 hours (15 minutes)
    const hours = Math.ceil(diffHours * 4) / 4;
    
    const subtotal = Math.round(pricePerHour * hours * 100); // Convert to cents
    const platformFee = calculatePlatformFee(subtotal);
    const tax = calculateTax(subtotal, platformFee);
    const total = subtotal + platformFee + tax;
    
    return {
        subtotal,
        platformFee,
        tax,
        total,
        currency: 'cad'
    };
};

/**
 * Calculate pricing for fixed/session booking
 */
const calculateFixedPricing = (pricePerSession) => {
    const subtotal = Math.round(pricePerSession * 100); // Convert to cents
    const platformFee = calculatePlatformFee(subtotal);
    const tax = calculateTax(subtotal, platformFee);
    const total = subtotal + platformFee + tax;
    
    return {
        subtotal,
        platformFee,
        tax,
        total,
        currency: 'cad'
    };
};

/**
 * Validate booking dates and times
 */
const validateBookingTimes = (bookingStart, bookingEnd, service) => {
    const errors = [];
    const now = new Date();
    const minDaysAhead = 1; // Minimum 1 day in advance
    const maxDaysAhead = 88; // Maximum 88 days in advance
    
    const start = new Date(bookingStart);
    const end = new Date(bookingEnd);
    
    // Validate dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push('Invalid booking date format');
        return { isValid: false, errors };
    }
    
    // Validate end is after start
    if (end <= start) {
        errors.push('Booking end time must be after start time');
    }
    
    // Validate booking is in the future
    if (start <= now) {
        errors.push('Booking must be scheduled for a future date');
    }
    
    // Validate minimum advance booking (1 day)
    const minDate = new Date(now);
    minDate.setDate(minDate.getDate() + minDaysAhead);
    minDate.setHours(0, 0, 0, 0);
    
    if (start < minDate) {
        errors.push(`Booking must be at least ${minDaysAhead} day(s) in advance`);
    }
    
    // Validate maximum advance booking (88 days)
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + maxDaysAhead);
    maxDate.setHours(23, 59, 59, 999);
    
    if (start > maxDate) {
        errors.push(`Booking cannot be more than ${maxDaysAhead} days in advance`);
    }
    
    // Validate time slot matches service availability (basic check)
    // More detailed availability validation can be added here
    
    if (errors.length > 0) {
        return { isValid: false, errors };
    }
    
    return { isValid: true };
};

/**
 * Create a booking request
 */
const createBookingRequest = async (clientId, bookingData) => {
    try {
        const { serviceId, pricingOptionId, bookingStart, bookingEnd, notes, billingDetails } = bookingData;
        
        // Validate service exists and is active
        const service = await serviceRepository.findById(serviceId);
        if (!service) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'SERVICE_NOT_FOUND'
            };
        }
        
        if (service.status !== 'active' || service.isDeleted) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'SERVICE_NOT_AVAILABLE'
            };
        }
        
        // Validate booking times
        const timeValidation = validateBookingTimes(bookingStart, bookingEnd, service);
        if (!timeValidation.isValid) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_BOOKING_TIME',
                data: { errors: timeValidation.errors }
            };
        }
        
        // Check for booking conflicts
        const hasConflict = await bookingRequestRepository.hasBookingConflict(
            serviceId,
            bookingStart,
            bookingEnd
        );
        
        if (hasConflict) {
            return {
                success: false,
                statusCode: 409,
                errorKey: 'BOOKING_CONFLICT'
            };
        }
        
        // Calculate pricing
        let pricingSnapshot;
        
        if (service.listingType === 'hourly') {
            if (!service.pricePerHour) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'INVALID_SERVICE_PRICING'
                };
            }
            pricingSnapshot = calculateHourlyPricing(service.pricePerHour, bookingStart, bookingEnd);
        } else if (service.listingType === 'fixed') {
            if (!service.pricingOptions || service.pricingOptions.length === 0) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'INVALID_SERVICE_PRICING'
                };
            }
            
            // Find the selected pricing option
            let selectedOption;
            if (pricingOptionId) {
                selectedOption = service.pricingOptions.find(
                    opt => opt._id.toString() === pricingOptionId.toString()
                );
            } else {
                // Default to first option if none specified
                selectedOption = service.pricingOptions[0];
            }
            
            if (!selectedOption) {
                return {
                    success: false,
                    statusCode: 400,
                    errorKey: 'INVALID_PRICING_OPTION'
                };
            }
            
            pricingSnapshot = calculateFixedPricing(selectedOption.pricePerSession);
        } else {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_SERVICE_TYPE'
            };
        }
        
        // Get or create Stripe customer
        const client = await userRepository.findById(clientId);
        if (!client) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'CLIENT_NOT_FOUND'
            };
        }
        
        // Use existing stripeCustomerId if available, otherwise create/retrieve
        let stripeCustomer;
        if (client.stripeCustomerId) {
            try {
                // Try to retrieve existing customer
                stripeCustomer = await stripeClient.stripe.customers.retrieve(client.stripeCustomerId);
            } catch (error) {
                // If customer doesn't exist in Stripe, create a new one
                stripeCustomer = await stripeClient.createOrRetrieveCustomer({
                    email: client.email,
                    name: `${client.firstName} ${client.lastName}`,
                    metadata: {
                        userId: clientId.toString(),
                        userRole: 'client'
                    }
                });
                // Update user with new stripeCustomerId
                await userRepository.updateById(clientId, { stripeCustomerId: stripeCustomer.id });
            }
        } else {
            stripeCustomer = await stripeClient.createOrRetrieveCustomer({
                email: client.email,
                name: `${client.firstName} ${client.lastName}`,
                metadata: {
                    userId: clientId.toString(),
                    userRole: 'client'
                }
            });
            // Store stripeCustomerId on user for future use
            await userRepository.updateById(clientId, { stripeCustomerId: stripeCustomer.id });
        }
        
        // Create SetupIntent
        const setupIntent = await stripeClient.createSetupIntent({
            customerId: stripeCustomer.id,
            metadata: {
                serviceId: serviceId.toString(),
                clientId: clientId.toString(),
                vendorId: service.vendor._id.toString()
            }
        });
        
        // Create booking request
        const bookingRequest = await bookingRequestRepository.create({
            serviceId,
            vendorId: service.vendor._id,
            clientId,
            bookingStart: new Date(bookingStart),
            bookingEnd: new Date(bookingEnd),
            notes: notes || '',
            pricingSnapshot,
            status: 'payment_pending',
            stripeCustomerId: stripeCustomer.id,
            stripeSetupIntentId: setupIntent.id
        });
        
        return {
            success: true,
            statusCode: 201,
            data: {
                bookingRequestId: bookingRequest._id,
                stripe: {
                    clientSecret: setupIntent.client_secret
                },
                pricing: pricingSnapshot
            }
        };
        
    } catch (error) {
        console.error('Create booking request error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Complete payment method setup
 */
const completePaymentMethod = async (bookingRequestId, clientId, setupIntentId) => {
    try {
        // Fetch booking request
        const bookingRequest = await bookingRequestRepository.findById(bookingRequestId);
        
        if (!bookingRequest) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'BOOKING_REQUEST_NOT_FOUND'
            };
        }
        
        // Ensure booking belongs to client
        if (bookingRequest.clientId._id.toString() !== clientId.toString()) {
            return {
                success: false,
                statusCode: 403,
                errorKey: 'FORBIDDEN'
            };
        }
        
        // Verify SetupIntent
        const setupIntent = await stripeClient.retrieveSetupIntent(setupIntentId);
        
        if (setupIntent.id !== bookingRequest.stripeSetupIntentId) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_SETUP_INTENT'
            };
        }
        
        if (setupIntent.status !== 'succeeded') {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'SETUP_INTENT_NOT_COMPLETED',
                data: { status: setupIntent.status }
            };
        }
        
        // Extract payment method
        const paymentMethodId = setupIntent.payment_method;
        
        if (!paymentMethodId) {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'PAYMENT_METHOD_NOT_FOUND'
            };
        }
        
        // Update booking request
        const updatedBooking = await bookingRequestRepository.updateById(bookingRequestId, {
            stripePaymentMethodId: paymentMethodId,
            status: 'pending_vendor'
        });
        
        return {
            success: true,
            statusCode: 200,
            data: {
                bookingRequest: updatedBooking
            }
        };
        
    } catch (error) {
        console.error('Complete payment method error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Vendor accepts booking request
 */
const acceptBookingRequest = async (bookingRequestId, vendorId) => {
    try {
        // Fetch booking request
        const bookingRequest = await bookingRequestRepository.findById(bookingRequestId);
        
        if (!bookingRequest) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'BOOKING_REQUEST_NOT_FOUND'
            };
        }
        
        // Ensure booking belongs to vendor
        if (bookingRequest.vendorId._id.toString() !== vendorId.toString()) {
            return {
                success: false,
                statusCode: 403,
                errorKey: 'FORBIDDEN'
            };
        }
        
        // Ensure status is pending_vendor
        if (bookingRequest.status !== 'pending_vendor') {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_BOOKING_STATUS',
                data: { currentStatus: bookingRequest.status }
            };
        }
        
        // Re-check availability to prevent race conditions
        const hasConflict = await bookingRequestRepository.hasBookingConflict(
            bookingRequest.serviceId._id,
            bookingRequest.bookingStart,
            bookingRequest.bookingEnd,
            bookingRequestId
        );
        
        if (hasConflict) {
            return {
                success: false,
                statusCode: 409,
                errorKey: 'BOOKING_CONFLICT'
            };
        }
        
        // Create and confirm PaymentIntent
        try {
            const paymentIntent = await stripeClient.createPaymentIntent({
                amount: bookingRequest.pricingSnapshot.total,
                currency: bookingRequest.pricingSnapshot.currency,
                customerId: bookingRequest.stripeCustomerId,
                paymentMethodId: bookingRequest.stripePaymentMethodId,
                metadata: {
                    bookingRequestId: bookingRequestId.toString(),
                    serviceId: bookingRequest.serviceId._id.toString(),
                    clientId: bookingRequest.clientId._id.toString(),
                    vendorId: vendorId.toString()
                },
                confirm: true
            });
            
            // Determine status based on payment intent status
            let newStatus;
            if (paymentIntent.status === 'succeeded') {
                newStatus = 'paid';
            } else if (paymentIntent.status === 'requires_action') {
                newStatus = 'action_required';
            } else if (paymentIntent.status === 'requires_payment_method' || 
                       paymentIntent.status === 'canceled') {
                newStatus = 'payment_failed';
            } else {
                newStatus = 'payment_failed';
            }
            
            // Update booking request
            const updatedBooking = await bookingRequestRepository.updateById(bookingRequestId, {
                stripePaymentIntentId: paymentIntent.id,
                status: newStatus
            });
            
            return {
                success: true,
                statusCode: 200,
                data: {
                    bookingRequest: updatedBooking,
                    paymentStatus: paymentIntent.status,
                    requiresAction: paymentIntent.status === 'requires_action',
                    clientSecret: paymentIntent.status === 'requires_action' ? paymentIntent.client_secret : null
                }
            };
            
        } catch (stripeError) {
            console.error('Stripe payment error:', stripeError);
            
            // Handle Stripe errors
            let newStatus = 'payment_failed';
            let errorKey = 'PAYMENT_FAILED';
            
            if (stripeError.type === 'StripeCardError') {
                errorKey = 'CARD_DECLINED';
            } else if (stripeError.type === 'StripeAuthenticationError') {
                errorKey = 'STRIPE_AUTH_ERROR';
            } else if (stripeError.type === 'StripeAPIError') {
                errorKey = 'STRIPE_API_ERROR';
            }
            
            // Update booking request with failed status
            await bookingRequestRepository.updateById(bookingRequestId, {
                status: newStatus
            });
            
            return {
                success: false,
                statusCode: 402,
                errorKey,
                error: stripeError.message
            };
        }
        
    } catch (error) {
        console.error('Accept booking request error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Vendor rejects booking request
 */
const rejectBookingRequest = async (bookingRequestId, vendorId, rejectionReason = null) => {
    try {
        // Fetch booking request
        const bookingRequest = await bookingRequestRepository.findById(bookingRequestId);
        
        if (!bookingRequest) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'BOOKING_REQUEST_NOT_FOUND'
            };
        }
        
        // Ensure booking belongs to vendor
        if (bookingRequest.vendorId._id.toString() !== vendorId.toString()) {
            return {
                success: false,
                statusCode: 403,
                errorKey: 'FORBIDDEN'
            };
        }
        
        // Ensure status is pending_vendor
        if (bookingRequest.status !== 'pending_vendor') {
            return {
                success: false,
                statusCode: 400,
                errorKey: 'INVALID_BOOKING_STATUS',
                data: { currentStatus: bookingRequest.status }
            };
        }
        
        // Update booking request
        const updatedBooking = await bookingRequestRepository.updateById(bookingRequestId, {
            status: 'rejected',
            rejectionReason: rejectionReason || ''
        });
        
        return {
            success: true,
            statusCode: 200,
            data: {
                bookingRequest: updatedBooking
            }
        };
        
    } catch (error) {
        console.error('Reject booking request error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Get booking request by ID
 */
const getBookingRequestById = async (bookingRequestId, userId, userRole) => {
    try {
        const bookingRequest = await bookingRequestRepository.findById(bookingRequestId);
        
        if (!bookingRequest) {
            return {
                success: false,
                statusCode: 404,
                errorKey: 'BOOKING_REQUEST_NOT_FOUND'
            };
        }
        
        // Check access permissions
        const isClient = bookingRequest.clientId._id.toString() === userId.toString();
        const isVendor = bookingRequest.vendorId._id.toString() === userId.toString();
        const isAdmin = userRole === 'admin';
        
        if (!isClient && !isVendor && !isAdmin) {
            return {
                success: false,
                statusCode: 403,
                errorKey: 'FORBIDDEN'
            };
        }
        
        return {
            success: true,
            statusCode: 200,
            data: {
                bookingRequest
            }
        };
        
    } catch (error) {
        console.error('Get booking request error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Get booking requests for client
 */
const getClientBookingRequests = async (clientId, filters = {}) => {
    try {
        const bookingRequests = await bookingRequestRepository.findByClientId(clientId, filters);
        
        return {
            success: true,
            statusCode: 200,
            data: {
                bookingRequests
            }
        };
        
    } catch (error) {
        console.error('Get client booking requests error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

/**
 * Get booking requests for vendor
 */
const getVendorBookingRequests = async (vendorId, filters = {}) => {
    try {
        const bookingRequests = await bookingRequestRepository.findByVendorId(vendorId, filters);
        
        return {
            success: true,
            statusCode: 200,
            data: {
                bookingRequests
            }
        };
        
    } catch (error) {
        console.error('Get vendor booking requests error:', error);
        return {
            success: false,
            statusCode: 500,
            errorKey: 'INTERNAL_SERVER_ERROR',
            error: error.message
        };
    }
};

module.exports = {
    createBookingRequest,
    completePaymentMethod,
    acceptBookingRequest,
    rejectBookingRequest,
    getBookingRequestById,
    getClientBookingRequests,
    getVendorBookingRequests
};
