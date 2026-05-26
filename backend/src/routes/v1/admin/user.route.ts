import { Router } from 'express';
import { AdminUserController } from '../../../controllers/v1/admin/user.controller.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';

const router = Router();
const userController = new AdminUserController();

router.use(verifyToken, isAdmin);

router.get('/', userController.getAll);
router.put('/:id/status', userController.updateStatus);
router.put('/:id/role', userController.updateRole);

export default router;
