const multer = require('multer');
const { getErrorMessage } = require('../errors/errorHelper');
const errorMessages = require('../errors/errorMessages');

/**
 * Configure Multer with memory storage
 * Files are stored in memory as Buffer objects
 */
const storage = multer.memoryStorage();

/**
 * File filter to only allow image types
 */
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpg, jpeg, png, webp)'), false);
    }
};

/**
 * Multer configuration
 */
const multerConfig = {
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB per file
        files: 10 // Maximum 10 files
    }
};

/**
 * Middleware for uploading multiple service images (up to 10)
 * Field name: "photos"
 */
const uploadServiceImages = multer(multerConfig).array('photos', 10);

/**
 * Middleware for uploading a single image
 * Field name: "image"
 */
const uploadSingleImage = multer(multerConfig).single('image');

/**
 * Error handler for Multer errors
 */
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                statusCode: 400,
                data: null,
                error: {
                    timestamp: new Date().toISOString(),
                    message: 'File size exceeds 20MB limit',
                    stacktrace: null
                }
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                statusCode: 400,
                data: null,
                error: {
                    timestamp: new Date().toISOString(),
                    message: 'Maximum 10 images allowed',
                    stacktrace: null
                }
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                statusCode: 400,
                data: null,
                error: {
                    timestamp: new Date().toISOString(),
                    message: 'Unexpected file field. Use "photos" for multiple images or "image" for single image',
                    stacktrace: null
                }
            });
        }
    }
    
    if (err.message && err.message.includes('Only images are allowed')) {
        return res.status(400).json({
            statusCode: 400,
            data: null,
            error: {
                timestamp: new Date().toISOString(),
                message: 'Only images are allowed (jpg, jpeg, png, webp)',
                stacktrace: null
            }
        });
    }
    
    // Pass other errors to next error handler
    next(err);
};

module.exports = {
    uploadServiceImages,
    uploadSingleImage,
    handleMulterError
};
