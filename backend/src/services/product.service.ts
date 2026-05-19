import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';
import { ProductStatus, Prisma, SizeEnum, ColorEnum, CategoryType } from '@prisma/client';

export interface ProductVariantInput {
  size: SizeEnum;
  color: ColorEnum;
  stock: number;
  sku?: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  categoryId: string;
  thumbnail: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  material?: string;
  fit?: string;
  style?: string;
  tags?: string[];
  status?: ProductStatus;
  variants: ProductVariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  thumbnail?: string;
  images?: string[];
  price?: number;
  discountPrice?: number;
  material?: string;
  fit?: string;
  style?: string;
  tags?: string[];
  status?: ProductStatus;
  variants?: ProductVariantInput[];
}

export interface ProductQueryFilters {
  search?: string;
  categoryId?: string;
  categoryType?: CategoryType;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  colors?: ColorEnum[];
  sizes?: SizeEnum[];
  page?: number;
  limit?: number;
}

export class ProductService {
  // Vietnamese slug generator helper
  private generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /**
   * Create a new product with variants
   */
  public createProduct = async (input: CreateProductInput) => {
    // 1. Verify Category exists
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const name = input.name.trim();
    let slug = this.generateSlug(name);

    // Ensure slug is unique (append unique suffix if duplicate exists)
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 2. Validate and generate SKUs for variants
    const processedVariants = input.variants.map((v) => {
      const variantSku =
        v.sku?.trim() || `${slug}-${v.color.toLowerCase()}-${v.size.toLowerCase()}`;
      return {
        size: v.size,
        color: v.color,
        stock: v.stock,
        sku: variantSku,
      };
    });

    const skus = processedVariants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);
    if (uniqueSkus.size !== skus.length) {
      throw new BadRequestException('Duplicate SKUs in the product variants list');
    }

    // Verify SKUs do not already exist in database
    const existingSku = await prisma.productVariant.findFirst({
      where: { sku: { in: skus } },
    });
    if (existingSku) {
      throw new BadRequestException(
        `Product variant with SKU '${existingSku.sku}' already exists in database`
      );
    }

    // 3. Create Product and Variants in a transaction
    return prisma.product.create({
      data: {
        name,
        slug,
        description: input.description.trim(),
        categoryId: input.categoryId,
        thumbnail: input.thumbnail.trim(),
        images: input.images || [],
        price: input.price,
        discountPrice: input.discountPrice,
        material: input.material?.trim(),
        fit: input.fit?.trim(),
        style: input.style?.trim(),
        tags: input.tags || [],
        status: input.status || 'ACTIVE',
        variants: {
          create: processedVariants,
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });
  };

  /**
   * Get all products with filters, search, and pagination
   */
  public getAllProducts = async (filters: ProductQueryFilters) => {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProductWhereInput = {};

    // Apply Search filter (matches name, slug, or tags)
    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      whereClause.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { slug: { contains: searchLower, mode: 'insensitive' } },
        { tags: { has: searchLower } },
      ];
    }

    // Apply Category filter
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    // Apply CategoryType filter (Parent Category)
    if (filters.categoryType) {
      whereClause.category = {
        type: filters.categoryType,
      };
    }

    // Apply Status filter
    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Apply Price filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      whereClause.price = {};
      if (filters.minPrice !== undefined) {
        whereClause.price.gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        whereClause.price.lte = Number(filters.maxPrice);
      }
    }

    // Apply Color and Size filter via variants
    if ((filters.colors && filters.colors.length > 0) || (filters.sizes && filters.sizes.length > 0)) {
      whereClause.variants = {
        some: {
          ...(filters.colors && filters.colors.length > 0 ? { color: { in: filters.colors } } : {}),
          ...(filters.sizes && filters.sizes.length > 0 ? { size: { in: filters.sizes } } : {}),
        },
      };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: true,
          category: true,
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  /**
   * Get product detail by ID or Slug
   */
  public getProductById = async (idOrSlug: string) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

    const product = await prisma.product.findUnique({
      where: isObjectId ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        variants: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  };

  /**
   * Update a product by ID
   */
  public updateProduct = async (id: string, input: UpdateProductInput) => {
    // 1. Verify Product exists
    const product = await this.getProductById(id);

    const updateData: Prisma.ProductUpdateInput = {};

    // Update basic fields
    if (input.name !== undefined) {
      updateData.name = input.name.trim();
      // Regenerate slug if name changes
      if (input.name.trim() !== product.name) {
        let slug = this.generateSlug(input.name.trim());
        const existingSlug = await prisma.product.findFirst({
          where: { slug, id: { not: id } },
        });
        if (existingSlug) {
          slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        updateData.slug = slug;
      }
    }

    if (input.description !== undefined) updateData.description = input.description.trim();
    if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail.trim();
    if (input.images !== undefined) updateData.images = input.images;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.discountPrice !== undefined) updateData.discountPrice = input.discountPrice;
    if (input.material !== undefined) updateData.material = input.material.trim() || null;
    if (input.fit !== undefined) updateData.fit = input.fit.trim() || null;
    if (input.style !== undefined) updateData.style = input.style.trim() || null;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.status !== undefined) updateData.status = input.status;

    // Check category relation
    if (input.categoryId !== undefined && input.categoryId !== product.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      updateData.category = { connect: { id: input.categoryId } };
    }

    // 2. Perform database update
    return prisma.$transaction(async (tx) => {
      // If variants are supplied, replace existing variants
      if (input.variants !== undefined) {
        const slug = updateData.slug ? (updateData.slug as string) : product.slug;

        const processedVariants = input.variants.map((v) => {
          const variantSku =
            v.sku?.trim() || `${slug}-${v.color.toLowerCase()}-${v.size.toLowerCase()}`;
          return {
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: variantSku,
          };
        });

        const skus = processedVariants.map((v) => v.sku);
        const uniqueSkus = new Set(skus);
        if (uniqueSkus.size !== skus.length) {
          throw new BadRequestException('Duplicate SKUs in the product variants list');
        }

        // Verify SKUs do not already exist in database (excluding existing variants of this product)
        const existingSku = await tx.productVariant.findFirst({
          where: {
            sku: { in: skus },
            productId: { not: id },
          },
        });
        if (existingSku) {
          throw new BadRequestException(
            `Product variant with SKU '${existingSku.sku}' already exists in database`
          );
        }

        // Delete existing variants
        await tx.productVariant.deleteMany({ where: { productId: id } });

        // Add create payload to update data
        updateData.variants = {
          create: processedVariants,
        };
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          variants: true,
          category: true,
        },
      });
    });
  };

  /**
   * Delete product by ID
   */
  public deleteProduct = async (id: string) => {
    // 1. Verify product exists
    const product = await this.getProductById(id);
    const variantIds = product.variants.map((v) => v.id);

    // 2. Check if product variants have been ordered to prevent broken histories
    const orderCount = await prisma.order.count({
      where: {
        items: {
          some: {
            productVariantId: { in: variantIds },
          },
        },
      },
    });

    if (orderCount > 0) {
      throw new BadRequestException(
        'Cannot delete product because it has associated orders. Please set status to INACTIVE instead.'
      );
    }

    // 3. Delete from database (ProductVariant is deleted automatically via Prisma Cascade onDelete relation)
    await prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  };
}

export default ProductService;
