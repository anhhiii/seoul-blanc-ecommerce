import { Router } from 'express';
import { ClientProfileController } from '../../../controllers/v1/client/profile.controller.js';
import { ProfileService } from '../../../services/profile.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateAvatarSchema,
} from '../../../validations/profile.validation.js';

const router = Router();

// Instantiate Service and Inject into Controller (DI)
const profileService = new ProfileService();
const profileController = new ClientProfileController(profileService);

// All profile routes require verification
router.use(verifyToken);

// Routes definition
router.get('/', profileController.get);
router.put('/', validate(updateProfileSchema), profileController.update);
router.put('/avatar', validate(updateAvatarSchema), profileController.updateAvatar);
router.put('/change-password', validate(changePasswordSchema), profileController.changePassword);

export default router;
