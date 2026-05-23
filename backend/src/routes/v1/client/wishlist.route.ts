import { Router } from 'express';
import { ClientWishlistController } from '../../../controllers/v1/client/wishlist.controller.js';
import { WishlistService } from '../../../services/wishlist.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();

const wishlistService = new WishlistService();
const wishlistController = new ClientWishlistController(wishlistService);

// Secure all wishlist routes
router.use(verifyToken);

router.get('/', wishlistController.get);
router.post('/toggle', wishlistController.toggle);
router.get('/ids', wishlistController.getIds);

export default router;
