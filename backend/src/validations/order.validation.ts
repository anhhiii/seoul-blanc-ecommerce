import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string({
      required_error: 'Địa chỉ nhận hàng (addressId) là bắt buộc',
    }).min(1, 'Địa chỉ nhận hàng không hợp lệ'),
    note: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'RETURNED', 'CANCELLED'], {
      required_error: 'Trạng thái đơn hàng là bắt buộc',
    }),
  }),
});
