import { Response } from 'express';
import { ProfileService } from '../../../services/profile.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { toUserResponseDTO } from '../../../mappers/user.mapper.js';

export class ClientProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get user profile details
   */
  public get = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    // We can reuse findUnique from prisma here directly or via a service method
    const { prisma } = await import('../../../config/prisma.js');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendResponse(res, 404, 'Không tìm thấy thông tin tài khoản');
    }
    return sendResponse(res, 200, 'Lấy thông tin tài khoản thành công', {
      user: toUserResponseDTO(user),
    });
  });

  /**
   * Update profile information
   */
  public update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { fullName, phoneNumber, gender } = req.body;
    const user = await this.profileService.updateProfile(userId, { fullName, phoneNumber, gender });
    return sendResponse(res, 200, 'Cập nhật thông tin tài khoản thành công', {
      user: toUserResponseDTO(user),
    });
  });

  /**
   * Update avatar
   */
  public updateAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { avatar } = req.body; // Can be a string URL or null to delete
    const user = await this.profileService.updateAvatar(userId, avatar || null);
    return sendResponse(res, 200, 'Cập nhật ảnh đại diện thành công', {
      user: toUserResponseDTO(user),
    });
  });

  /**
   * Change password
   */
  public changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;
    const result = await this.profileService.changePassword(userId, { oldPassword, newPassword });
    return sendResponse(res, 200, result.message);
  });
}

export default ClientProfileController;
