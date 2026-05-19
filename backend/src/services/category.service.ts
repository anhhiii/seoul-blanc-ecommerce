import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';
import { CategoryType, Prisma } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  type: CategoryType;
  description?: string;
  image?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  type?: CategoryType;
  description?: string;
  image?: string;
}

export class CategoryService {
  // Vietnamese-compatible slug generator helper
  private generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese accent marks
      .replace(/[đĐ]/g, 'd') // Replace native "đ" / "Đ" with "d"
      .replace(/([^0-9a-z-\s])/g, '') // Remove other non-alphanumeric chars except space/hyphen
      .replace(/(\s+)/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace duplicate hyphens
      .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
  };

  // Create a new category
  public createCategory = async (input: CreateCategoryInput) => {
    const name = input.name.trim();
    const slug = input.slug ? input.slug.trim() : this.generateSlug(name);

    // Check if slug is already taken
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      throw new BadRequestException(`Category with slug '${slug}' already exists`);
    }

    return prisma.category.create({
      data: {
        name,
        slug,
        type: input.type,
        description: input.description?.trim(),
        image: input.image?.trim(),
      },
    });
  };

  // Get all categories ordered by creation date
  public getAllCategories = async () => {
    return prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  };

  // Get a single category by ID
  public getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  };

  // Update category by ID
  public updateCategory = async (id: string, input: UpdateCategoryInput) => {
    // Verify category exists
    const category = await this.getCategoryById(id);

    const updateData: Prisma.CategoryUpdateInput = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }

    if (input.type !== undefined) {
      updateData.type = input.type;
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim();
    }

    if (input.image !== undefined) {
      updateData.image = input.image?.trim();
    }

    if (input.slug !== undefined) {
      const slug = input.slug.trim();
      // Ensure new slug is unique
      if (slug !== category.slug) {
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
          throw new BadRequestException(`Category with slug '${slug}' already exists`);
        }
      }
      updateData.slug = slug;
    } else if (input.name !== undefined && input.name.trim() !== category.name) {
      // Regenerate slug if name is updated and no custom slug is specified
      const newSlug = this.generateSlug(input.name.trim());
      if (newSlug !== category.slug) {
        const existing = await prisma.category.findUnique({ where: { slug: newSlug } });
        if (!existing) {
          updateData.slug = newSlug;
        }
      }
    }

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  };

  // Delete category by ID (safe deletion checking products first)
  public deleteCategory = async (id: string) => {
    // Verify category exists
    await this.getCategoryById(id);

    // Prevent deletion if there are associated products to maintain referential integrity
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. There are ${productCount} product(s) associated with this category.`
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  };
}
export default CategoryService;
