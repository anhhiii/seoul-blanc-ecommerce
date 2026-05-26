import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

export class AdminUserController {
  /**
   * Get all registered users
   */
  public getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        phoneNumber: true,
        gender: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    return sendResponse(res, 200, 'Lấy danh sách người dùng thành công', { users });
  });

  /**
   * Update status (e.g. block/unblock user)
   */
  public updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE, INACTIVE, BLOCKED

    if (!status || !['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
      return sendResponse(res, 400, 'Trạng thái không hợp lệ');
    }

    if (id === req.user!.id) {
      return sendResponse(res, 400, 'Bạn không thể tự khóa tài khoản của chính mình.');
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { status },
      select: { id: true, fullName: true, status: true }
    });

    return sendResponse(res, 200, 'Cập nhật trạng thái người dùng thành công', { user });
  });

  /**
   * Change user role (USER <-> ADMIN)
   */
  public updateRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body; // USER, ADMIN

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return sendResponse(res, 400, 'Vai trò không hợp lệ');
    }

    if (id === req.user!.id) {
      return sendResponse(res, 400, 'Bạn không thể tự thay đổi vai trò của chính mình.');
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { role },
      select: { id: true, fullName: true, role: true }
    });

    return sendResponse(res, 200, 'Cập nhật vai trò người dùng thành công', { user });
  });
}
