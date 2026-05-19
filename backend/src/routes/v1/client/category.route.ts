import { Router } from 'express';
import { ClientCategoryController } from '../../../controllers/v1/client/category.controller.js';
import { CategoryService } from '../../../services/category.service.js';

const router = Router();

// Instantiate Service and Inject into Controller (DI)
const categoryService = new CategoryService();
const categoryController = new ClientCategoryController(categoryService);

// Public Routes (no verifyToken required)
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

export default router;
