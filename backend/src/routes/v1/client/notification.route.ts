import { Router } from 'express';
import { NotificationController } from '../../../controllers/v1/client/notification.controller.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const notificationController = new NotificationController();

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.post('/mark-all-read', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
