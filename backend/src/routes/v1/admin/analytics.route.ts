import { Router } from 'express';
import { AdminAnalyticsController } from '../../../controllers/v1/admin/analytics.controller.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';

const router = Router();
const analyticsController = new AdminAnalyticsController();

router.get('/dashboard', verifyToken, isAdmin, analyticsController.getDashboardStats);

export default router;
