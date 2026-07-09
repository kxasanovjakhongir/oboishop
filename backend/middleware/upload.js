const multer = require('multer');
const path = require('path');

const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, `uploads/${folder}`),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Faqat rasm fayllari ruxsat etiladi'));
};

exports.uploadImages = multer({ storage: storage('images'), fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadTexture = multer({ storage: storage('textures'), fileFilter: imageFilter, limits: { fileSize: 20 * 1024 * 1024 } });
exports.uploadCategory = multer({ storage: storage('images'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadSettings = multer({ storage: storage('images'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
