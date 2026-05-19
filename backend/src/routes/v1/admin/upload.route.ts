import { Router } from 'express';
import { UploadController } from '../../../controllers/v1/admin/upload.controller.js';
import { UploadService } from '../../../shared/services/upload.service.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';
import { upload } from '../../../middlewares/upload.middleware.js';

const router = Router();

// Inject UploadService into UploadController
const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);

// Secured admin upload routes
router.post('/single', verifyToken, isAdmin, upload.single('image'), uploadController.uploadSingle);
router.post(
  '/multiple',
  verifyToken,
  isAdmin,
  upload.array('images', 10),
  uploadController.uploadMultiple
);

export default router;
