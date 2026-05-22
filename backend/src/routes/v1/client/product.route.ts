import { Router } from 'express';
import { ClientProductController } from '../../../controllers/v1/client/product.controller.js';
import { ProductService } from '../../../services/product.service.js';

const router = Router();

// Inject ProductService into ClientProductController
const productService = new ProductService();
const productController = new ClientProductController(productService);

// Public product routes
router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/:idOrSlug', productController.getByIdOrSlug);

export default router;
