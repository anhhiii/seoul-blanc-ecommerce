import { Router } from 'express';
import { AdminVoucherController } from '../../../controllers/v1/admin/voucher.controller.js';
import { VoucherService } from '../../../services/voucher.service.js';
import { verifyToken, isAdmin } from '../../../middlewares/auth.middleware.js';

const router = Router();

const voucherService = new VoucherService();
const voucherController = new AdminVoucherController(voucherService);

router.use(verifyToken, isAdmin);

router.post('/', voucherController.create);
router.get('/', voucherController.getAll);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.delete);

export default router;
