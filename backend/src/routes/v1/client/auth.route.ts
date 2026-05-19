import { Router } from 'express';
import { AuthController } from '../../../controllers/v1/client/auth.controller.js';
import { AuthService } from '../../../services/auth.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import {
  validate,
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from '../../../validations/auth.validation.js';

const router = Router();

// Instantiate Service and Inject into Controller (DI)
const authService = new AuthService();
const authController = new AuthController(authService);

// Routes definition
router.post('/register', validate(registerSchema), authController.register);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google-login', validate(googleLoginSchema), authController.googleLogin);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', verifyToken, authController.me);
router.post('/logout', verifyToken, authController.logout);

export default router;
