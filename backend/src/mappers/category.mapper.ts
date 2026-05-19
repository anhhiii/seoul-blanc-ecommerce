import { Category } from '@prisma/client';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
}

export const toCategoryDTO = (category: Category): CategoryDTO => {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    type: category.type,
    description: category.description,
    image: category.image,
    createdAt: category.createdAt,
  };
};

export const toCategoryDTOs = (categories: Category[]): CategoryDTO[] => {
  return categories.map(toCategoryDTO);
};
