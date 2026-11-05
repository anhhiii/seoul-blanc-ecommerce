import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z
      .string({
        required_error: 'Địa chỉ nhận hàng (addressId) là bắt buộc',
      })
      .min(1, 'Địa chỉ nhận hàng không hợp lệ'),
    paymentMethod: z.enum(['COD', 'SEPAY']).optional().default('COD'),
    note: z.string().optional(),
    voucherCode: z.string().optional(),
    selectedVariantIds: z.array(z.string()).optional(),
    directItem: z
      .object({
        productVariantId: z.string().min(1, 'Mã biến thể không được rỗng'),
        quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
      })
      .optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'RETURNED', 'CANCELLED'], {
      required_error: 'Trạng thái đơn hàng là bắt buộc',
    }),
  }),
});
