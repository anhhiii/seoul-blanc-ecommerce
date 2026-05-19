import { Router } from 'express';
import { AuthController } from '../../../controllers/v1/client/auth.controller.js';
import { AuthService } from '../../../services/auth.service.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { loginSchema } from '../../../validations/auth.validation.js';

const router = Router();

// Instantiate Service and Inject into Controller (DI)
const authService = new AuthService();
const authController = new AuthController(authService);

// Admin-specific routes definition (guarded with verifyToken and isAdmin)
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', verifyToken, isAdmin, authController.logout);

export default router;
