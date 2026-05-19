export type CategoryType = 'TOPS' | 'BOTTOMS' | 'OUTERWEAR' | 'DRESSES';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  image?: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  type: CategoryType;
  description?: string;
  image?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  type?: CategoryType;
  description?: string;
  image?: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

export interface CategoryDetailResponse {
  success: boolean;
  message: string;
  data: {
    category: Category;
  };
}
