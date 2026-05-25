import { Router } from 'express';
import { AdminOrderController } from '../../../controllers/v1/admin/order.controller.js';
import { OrderService } from '../../../services/order.service.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { updateOrderStatusSchema } from '../../../validations/order.validation.js';

const router = Router();
const orderService = new OrderService();
const orderController = new AdminOrderController(orderService);

router.use(verifyToken, isAdmin);

router.get('/', orderController.getAll);
router.put('/:id/status', validate(updateOrderStatusSchema), orderController.updateStatus);
router.post('/:id/return-request', orderController.handleReturnRequest);

export default router;
