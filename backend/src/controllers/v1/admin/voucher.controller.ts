import { Response } from 'express';
import { VoucherService } from '../../../services/voucher.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class AdminVoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  /**
   * Create a new voucher
   */
  public create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit } = req.body;

    if (!code || !discountType || typeof discountValue !== 'number' || !startDate || !endDate || typeof usageLimit !== 'number') {
      return sendResponse(res, 400, 'Vui lòng cung cấp đầy đủ thông tin mã giảm giá');
    }

    try {
      const voucher = await this.voucherService.createVoucher({
        code,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount,
        startDate,
        endDate,
        usageLimit
      });
      return sendResponse(res, 201, 'Tạo mã giảm giá thành công', { voucher });
    } catch (error: any) {
      return sendResponse(res, 400, error.message || 'Không thể tạo mã giảm giá');
    }
  });

  /**
   * Update voucher details
   */
  public update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      const voucher = await this.voucherService.updateVoucher(id as string, req.body);
      return sendResponse(res, 200, 'Cập nhật mã giảm giá thành công', { voucher });
    } catch (error: any) {
      return sendResponse(res, 400, error.message || 'Không thể cập nhật mã giảm giá');
    }
  });

  /**
   * Delete a voucher
   */
  public delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      await this.voucherService.deleteVoucher(id as string);
      return sendResponse(res, 200, 'Xóa mã giảm giá thành công');
    } catch (error: any) {
      return sendResponse(res, 400, error.message || 'Không thể xóa mã giảm giá');
    }
  });

  /**
   * Get all vouchers
   */
  public getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const vouchers = await this.voucherService.getAllVouchersAdmin();
    return sendResponse(res, 200, 'Lấy danh sách mã giảm giá thành công', { vouchers });
  });
}
