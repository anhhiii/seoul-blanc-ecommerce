import { Router } from 'express';
import { AdminProductController } from '../../../controllers/v1/admin/product.controller.js';
import { ProductService } from '../../../services/product.service.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
} from '../../../validations/product.validation.js';

const router = Router();

// Inject ProductService into AdminProductController
const productService = new ProductService();
const productController = new AdminProductController(productService);

// Secure Admin Product Endpoints
router.post('/', verifyToken, isAdmin, validate(createProductSchema), productController.create);
router.get('/', verifyToken, isAdmin, productController.getAll);
router.get('/:id', verifyToken, isAdmin, productController.getById);
router.put('/:id', verifyToken, isAdmin, validate(updateProductSchema), productController.update);
router.delete('/:id', verifyToken, isAdmin, productController.delete);

export default router;
