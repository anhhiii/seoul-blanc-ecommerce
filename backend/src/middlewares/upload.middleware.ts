import { Request } from 'express';
import multer from 'multer';

// Configure memory storage to receive file buffer in memory
const storage = multer.memoryStorage();

// File filter validator to restrict uploads to images only
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
  } else {
    callback(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export default upload;
