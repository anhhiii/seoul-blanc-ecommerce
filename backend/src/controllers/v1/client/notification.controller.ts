import { Response } from 'express';
import { prisma } from '../../../config/prisma.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class NotificationController {
  public getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sendResponse(res, 200, 'Lấy danh sách thông báo thành công', { notifications });
  });

  public markRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return sendResponse(res, 404, 'Thông báo không tồn tại.');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendResponse(res, 200, 'Đã đọc thông báo', { notification: updated });
  });

  public markAllRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return sendResponse(res, 200, 'Đã đánh dấu tất cả là đã đọc.', null);
  });
}
