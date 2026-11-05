import { Router } from 'express';
import { settingController } from '../../../controllers/setting.controller.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken, isAdmin);

router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

export default router;
