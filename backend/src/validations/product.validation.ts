import { z } from 'zod';
import { ColorEnum } from '@prisma/client';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const variantSchema = z.object({
  size: z.enum(['S', 'M', 'L', 'XL'], {
    errorMap: () => ({ message: 'Size must be one of: S, M, L, XL' }),
  }),
  color: z.nativeEnum(ColorEnum, {
    errorMap: () => ({
      message: 'Color must be a valid ColorEnum value',
    }),
  }),
  stock: z.number().min(0, 'Stock must be at least 0'),
  sku: z.string().optional(),
});

export const createProductSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Product name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(500, 'Name cannot exceed 100 characters'),
      description: z
        .string({ required_error: 'Product description is required' })
        .min(10, 'Description must be at least 10 characters'),
      categoryId: z
        .string({ required_error: 'CategoryId is required' })
        .regex(objectIdRegex, 'Invalid category ID format'),
      thumbnail: z
        .string({ required_error: 'Product thumbnail is required' })
        .url('Thumbnail must be a valid URL'),
      images: z.array(z.string().url('Image must be a valid URL')).optional(),
      price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be at least 0'),
      discountPrice: z.number().min(0, 'Discount price must be at least 0').optional(),
      material: z.string().optional(),
      fit: z.string().optional(),
      style: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
      variants: z.array(variantSchema).min(1, 'Product must have at least one variant'),
    })
    .refine(
      (data) => {
        if (data.discountPrice !== undefined && data.discountPrice >= data.price) {
          return false;
        }
        return true;
      },
      {
        message: 'Discount price must be less than original price',
        path: ['discountPrice'],
      }
    ),
});

export const updateProductSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().min(10).optional(),
      categoryId: z.string().regex(objectIdRegex, 'Invalid category ID format').optional(),
      thumbnail: z.string().url().optional(),
      images: z.array(z.string().url()).optional(),
      price: z.number().min(0).optional(),
      discountPrice: z.number().min(0).optional(),
      material: z.string().optional(),
      fit: z.string().optional(),
      style: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
      variants: z.array(variantSchema).optional(),
    })
    .refine(
      (data) => {
        // If both are provided, make sure discount is lower than price
        if (data.price !== undefined && data.discountPrice !== undefined) {
          return data.discountPrice < data.price;
        }
        return true;
      },
      {
        message: 'Discount price must be less than original price',
        path: ['discountPrice'],
      }
    ),
});
