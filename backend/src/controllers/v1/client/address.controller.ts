import { Response } from 'express';
import { AddressService } from '../../../services/address.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class ClientAddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * Get all addresses of user
   */
  public getAddresses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const addresses = await this.addressService.getAddresses(userId);
    return sendResponse(res, 200, 'Lấy danh sách địa chỉ thành công', { addresses });
  });

  /**
   * Get detail of a specific address
   */
  public getAddressById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const address = await this.addressService.getAddressById(userId, id);
    return sendResponse(res, 200, 'Lấy thông tin chi tiết địa chỉ thành công', { address });
  });

  /**
   * Create a new address
   */
  public createAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const address = await this.addressService.createAddress(userId, req.body);
    return sendResponse(res, 201, 'Thêm địa chỉ thành công', { address });
  });

  /**
   * Update an address
   */
  public updateAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const address = await this.addressService.updateAddress(userId, id, req.body);
    return sendResponse(res, 200, 'Cập nhật địa chỉ thành công', { address });
  });

  /**
   * Delete an address
   */
  public deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const result = await this.addressService.deleteAddress(userId, id);
    return sendResponse(res, 200, result.message, null);
  });

  /**
   * Set address as default
   */
  public setDefaultAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const address = await this.addressService.setDefaultAddress(userId, id);
    return sendResponse(res, 200, 'Đặt địa chỉ mặc định thành công', { address });
  });
}
