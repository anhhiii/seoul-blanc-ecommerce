import { Router } from 'express';
import { ClientVoucherController } from '../../../controllers/v1/client/voucher.controller.js';
import { VoucherService } from '../../../services/voucher.service.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';

const router = Router();

const voucherService = new VoucherService();
const voucherController = new ClientVoucherController(voucherService);

router.get('/active', verifyToken, voucherController.getActive);
router.post('/verify', verifyToken, voucherController.verify);

export default router;
