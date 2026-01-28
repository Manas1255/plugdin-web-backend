const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');

/**
 * S3 Client Singleton
 * Creates and reuses a single S3 client instance
 */
let s3Client = null;

const getS3Client = () => {
    if (!s3Client) {
        s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    return s3Client;
};

/**
 * Get file extension from mime type
 */
const getExtensionFromMimeType = (mimeType) => {
    const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    };
    return mimeToExt[mimeType] || 'jpg';
};

/**
 * Upload file to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name (for extension detection if needed)
 * @param {string} mimeType - MIME type of the file
 * @param {string} folder - Folder path in S3 (e.g., 'services/{serviceId}', 'vendors/{vendorId}', 'temp')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
const uploadToS3 = async (buffer, fileName, mimeType, folder) => {
    try {
        const client = getS3Client();
        const bucket = process.env.AWS_S3_BUCKET || 'plugdin-web-bucket';
        
        // Generate unique filename
        const extension = getExtensionFromMimeType(mimeType);
        const uniqueFileName = `${randomUUID()}.${extension}`;
        
        // Construct S3 key (path)
        const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
        
        // Upload to S3
        // Note: ACLs are not used here as the bucket may have ACLs disabled.
        // For public access, ensure the bucket has a bucket policy that allows public read access.
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType
            // ACL removed - bucket policy should handle public access if needed
        });
        
        await client.send(command);
        
        // Construct and return public URL
        // For us-east-1, the URL format is different (no region in URL)
        const region = process.env.AWS_REGION || 'us-east-1';
        let publicUrl;
        if (region === 'us-east-1') {
            publicUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
        } else {
            publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        }
        
        return publicUrl;
        
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload file to S3');
    }
};

module.exports = {
    uploadToS3,
    getS3Client
};
