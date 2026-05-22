import { Router } from 'express';
import { ClientCartController } from '../../../controllers/v1/client/cart.controller.js';
import { CartService } from '../../../services/cart.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../../../validations/cart.validation.js';

const router = Router();

// Instantiate Service and Inject into Controller (DI)
const cartService = new CartService();
const cartController = new ClientCartController(cartService);

// All cart routes require verification
router.use(verifyToken);

// Routes definition
router.get('/', cartController.get);
router.post('/items', validate(addToCartSchema), cartController.add);
router.put('/items/:productVariantId', validate(updateCartItemSchema), cartController.update);
router.delete('/items/:productVariantId', cartController.remove);
router.delete('/', cartController.clear);

export default router;
