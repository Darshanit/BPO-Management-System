const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Ensure subfolders exist so Multer never fails writing to a missing directory
['avatars', 'documents', 'chat'].forEach((sub) => {
  const dir = path.join(UPLOAD_ROOT, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subfolder)),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`), false);
  }
};

const uploadAvatar = multer({
  storage: storage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

const uploadDocument = multer({
  storage: storage('documents'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

const uploadChatFile = multer({
  storage: storage('chat'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadAvatar, uploadDocument, uploadChatFile };
