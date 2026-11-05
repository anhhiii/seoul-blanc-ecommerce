import { Router } from 'express';
import { ClientWalletController } from '../../../controllers/v1/client/wallet.controller.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();
const controller = new ClientWalletController();

router.use(verifyToken);
router.get('/', controller.getWallet);

export default router;

