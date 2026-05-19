import { Router } from 'express';
import { AdminCategoryController } from '../../../controllers/v1/admin/category.controller.js';
import { CategoryService } from '../../../services/category.service.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../../../validations/category.validation.js';

const router = Router();

// Instantiate Service and Inject into Controller (DI)
const categoryService = new CategoryService();
const categoryController = new AdminCategoryController(categoryService);

// Require authentication and ADMIN role for all routes in this router
router.use(verifyToken, isAdmin);

// Routes definitions
router.post('/', validate(createCategorySchema), categoryController.create);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
