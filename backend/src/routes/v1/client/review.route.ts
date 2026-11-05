import { Router } from 'express';
import { ClientReviewController } from '../../../controllers/v1/client/review.controller.js';
import { ReviewService } from '../../../services/review.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();

const reviewService = new ReviewService();
const reviewController = new ClientReviewController(reviewService);

// Public route to view reviews by product ID (supports both standard and alias paths)
router.get('/:productId', reviewController.getByProduct);
router.get('/product/:productId', reviewController.getByProduct);

// Secure routes for creating/updating reviews
router.post('/', verifyToken, reviewController.create);

export default router;
