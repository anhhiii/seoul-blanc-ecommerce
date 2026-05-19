import { z } from 'zod';

// Category creation schema
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Category name is required',
      })
      .min(2, 'Category name must be at least 2 characters long')
      .max(50, 'Category name cannot exceed 50 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters long')
      .max(60, 'Slug cannot exceed 60 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric characters and hyphens only')
      .optional(),
    type: z.enum(['TOPS', 'BOTTOMS', 'OUTERWEAR', 'DRESSES'], {
      errorMap: () => ({
        message: 'Category type must be one of: TOPS, BOTTOMS, OUTERWEAR, DRESSES',
      }),
    }),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    image: z.string().optional(),
  }),
});

// Category update schema
export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Category name must be at least 2 characters long')
      .max(50, 'Category name cannot exceed 50 characters')
      .optional(),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters long')
      .max(60, 'Slug cannot exceed 60 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric characters and hyphens only')
      .optional(),
    type: z
      .enum(['TOPS', 'BOTTOMS', 'OUTERWEAR', 'DRESSES'], {
        errorMap: () => ({
          message: 'Category type must be one of: TOPS, BOTTOMS, OUTERWEAR, DRESSES',
        }),
      })
      .optional(),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    image: z.string().optional(),
  }),
});
