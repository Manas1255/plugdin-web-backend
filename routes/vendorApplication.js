const express = require('express');
const router = express.Router();
const vendorApplicationController = require('../controllers/vendorApplicationController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   POST /api/vendor-applications
 * @desc    Apply as vendor (public)
 * @access  Public
 */
router.post('/', vendorApplicationController.applyAsVendor);

/**
 * @route   GET /api/admin/vendor-applications
 * @desc    Get list of vendor applications (admin only)
 * @access  Admin
 * @query   status (optional): 'pending' | 'approved' | 'rejected'
 * @query   page (optional): page number (default: 1)
 * @query   limit (optional): items per page (default: 20)
 */
router.get(
    '/admin/vendor-applications',
    authenticate,
    authorize('admin'),
    vendorApplicationController.getApplicationsList
);

/**
 * @route   GET /api/admin/vendor-applications/:id
 * @desc    Get single vendor application by ID (admin only)
 * @access  Admin
 */
router.get(
    '/admin/vendor-applications/:id',
    authenticate,
    authorize('admin'),
    vendorApplicationController.getApplicationById
);

/**
 * @route   POST /api/admin/vendor-applications/:id/approve
 * @desc    Approve vendor application (admin only, authenticated)
 * @access  Admin
 */
router.post(
    '/admin/vendor-applications/:id/approve',
    authenticate,
    authorize('admin'),
    vendorApplicationController.approveApplicationAuth
);

/**
 * @route   GET /api/admin/vendor-applications/:id/approve
 * @desc    Approve vendor application via email link (no auth required)
 * @access  Public (with token)
 */
router.get(
    '/admin/vendor-applications/:id/approve',
    vendorApplicationController.approveApplicationLink
);

/**
 * @route   POST /api/admin/vendor-applications/:id/reject
 * @desc    Reject vendor application (admin only, authenticated)
 * @access  Admin
 */
router.post(
    '/admin/vendor-applications/:id/reject',
    authenticate,
    authorize('admin'),
    vendorApplicationController.rejectApplicationAuth
);

/**
 * @route   GET /api/admin/vendor-applications/:id/reject
 * @desc    Reject vendor application via email link (no auth required)
 * @access  Public (with token)
 */
router.get(
    '/admin/vendor-applications/:id/reject',
    vendorApplicationController.rejectApplicationLink
);

/**
 * @route   GET /api/admin/vendor-applications/:id/view
 * @desc    View vendor application via email link (no auth required)
 * @access  Public (with token)
 */
router.get(
    '/admin/vendor-applications/:id/view',
    vendorApplicationController.viewApplicationLink
);

module.exports = router;
