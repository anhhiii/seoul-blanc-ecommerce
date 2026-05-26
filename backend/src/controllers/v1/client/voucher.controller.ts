import { Response } from 'express';
import { VoucherService } from '../../../services/voucher.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class ClientVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  /**
   * Get active vouchers list for client wallet
   */
  public getActive = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const vouchers = await this.voucherService.getActiveVouchersClient();
    return sendResponse(res, 200, 'Lấy danh sách mã giảm giá thành công', { vouchers });
  });

  /**
   * Check and verify voucher on checkout
   */
  public verify = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { code, subtotal } = req.body;

    if (!code || typeof subtotal !== 'number') {
      return sendResponse(res, 400, 'Vui lòng cung cấp đầy đủ mã voucher và số tiền tạm tính');
    }

    try {
      const verification = await this.voucherService.verifyVoucher(code, subtotal);
      return sendResponse(res, 200, 'Áp dụng mã giảm giá thành công', { verification });
    } catch (error: any) {
      return sendResponse(res, 400, error.message || 'Mã giảm giá không hợp lệ');
    }
  });
}
