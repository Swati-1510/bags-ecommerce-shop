const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Local storage upload setup for fallback or direct use
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Uploads a local file to Cloudinary or returns the local server URL as a fallback.
 * @param {Object} file Multer file object
 * @returns {Promise<string>} Image URL
 */
const uploadImage = async (file) => {
  if (!file) return null;

  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  if (cloudName && apiKey && apiSecret) {
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'luxury_bags'
      });

      // Delete temporary local file
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting local file after Cloudinary upload:", err);
      });

      console.log(`Successfully uploaded image to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to local server path:", error.message);
      return `/uploads/${file.filename}`;
    }
  } else {
    return `/uploads/${file.filename}`;
  }
};

module.exports = {
  upload,
  uploadImage
};
