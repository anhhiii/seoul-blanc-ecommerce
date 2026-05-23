import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Họ và tên là bắt buộc',
      })
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    phoneNumber: z
      .string()
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
      .optional()
      .nullable()
      .or(z.literal('')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        required_error: 'Mật khẩu cũ là bắt buộc',
      })
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    newPassword: z
      .string({
        required_error: 'Mật khẩu mới là bắt buộc',
      })
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  }),
});

export const updateAvatarSchema = z.object({
  body: z.object({
    avatar: z
      .string({
        required_error: 'Đường dẫn avatar là bắt buộc',
      })
      .url('Đường dẫn avatar không hợp lệ'),
  }),
});
