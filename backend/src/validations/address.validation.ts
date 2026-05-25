import { z } from 'zod';

const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

export const createAddressSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Họ và tên người nhận là bắt buộc',
      })
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    phoneNumber: z
      .string({
        required_error: 'Số điện thoại nhận hàng là bắt buộc',
      })
      .regex(phoneRegex, 'Số điện thoại không hợp lệ'),
    province: z.string({
      required_error: 'Tỉnh/Thành phố là bắt buộc',
    }),
    district: z.string().optional().default(''),
    ward: z.string({
      required_error: 'Phường/Xã là bắt buộc',
    }),
    detail: z.string({
      required_error: 'Địa chỉ chi tiết là bắt buộc',
    }),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').optional(),
    phoneNumber: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ').optional(),
    province: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
    detail: z.string().optional(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
});
