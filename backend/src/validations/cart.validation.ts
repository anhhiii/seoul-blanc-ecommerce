import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productVariantId: z.string({
      required_error: 'Product variant ID is required',
    }),
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .int()
      .min(1, 'Quantity must be at least 1'),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .int()
      .min(1, 'Quantity must be at least 1'),
  }),
});
