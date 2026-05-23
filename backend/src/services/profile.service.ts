import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';
import { Gender } from '@prisma/client';

export class ProfileService {
  /**
   * Update user profile information
   */
  public updateProfile = async (
    userId: string,
    data: { fullName: string; phoneNumber?: string | null; gender?: Gender }
  ) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || null,
        gender: data.gender || 'OTHER',
      },
    });

    return updatedUser;
  };

  /**
   * Update user avatar
   */
  public updateAvatar = async (userId: string, avatarUrl: string | null) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarUrl,
      },
    });

    return updatedUser;
  };

  /**
   * Change user password
   */
  public changePassword = async (
    userId: string,
    data: { oldPassword?: string; newPassword?: string }
  ) => {
    const { oldPassword, newPassword } = data;
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Mật khẩu cũ và mật khẩu mới là bắt buộc');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException('Không tìm thấy người dùng hoặc tài khoản không mật khẩu');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Đổi mật khẩu thành công' };
  };
}
