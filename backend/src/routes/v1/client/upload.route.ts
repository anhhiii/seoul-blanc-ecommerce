import { Router } from 'express';
import { ClientUploadController } from '../../../controllers/v1/client/upload.controller.js';
import { UploadService } from '../../../shared/services/upload.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { upload } from '../../../middlewares/upload.middleware.js';

const router = Router();

// Inject UploadService into ClientUploadController
const uploadService = new UploadService();
const uploadController = new ClientUploadController(uploadService);

// Secured client route to upload avatar
router.post('/avatar', verifyToken, upload.single('image'), uploadController.uploadAvatar);

export default router;
