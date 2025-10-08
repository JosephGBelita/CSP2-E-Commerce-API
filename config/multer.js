const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images/products');
        ensureDirectoryExists(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images/profile');
        ensureDirectoryExists(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const userId = req.user.id;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile_' + userId + '_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 
    }
});

const uploadProfileImage = multer({
    storage: profileStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 
    }
});

module.exports = {
    uploadProductImage,
    uploadProfileImage
};