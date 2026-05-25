import { Router } from 'express';
import { ClientOrderController } from '../../../controllers/v1/client/order.controller.js';
import { OrderService } from '../../../services/order.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { createOrderSchema } from '../../../validations/order.validation.js';

const router = Router();
const orderService = new OrderService();
const orderController = new ClientOrderController(orderService);

router.use(verifyToken);

router.post('/', validate(createOrderSchema), orderController.create);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetails);
router.post('/:id/cancel', orderController.cancel);
router.post('/:id/refund', orderController.refund);

export default router;
