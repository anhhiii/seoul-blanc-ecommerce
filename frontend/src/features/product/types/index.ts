export type SizeType = 'S' | 'M' | 'L' | 'XL';

export type ColorType =
  | 'BLACK'
  | 'WHITE'
  | 'GRAY'
  | 'BEIGE'
  | 'BROWN'
  | 'NAVY'
  | 'GREEN';

export type ProductStatusType = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface ProductVariant {
  id?: string;
  size: SizeType;
  color: ColorType;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  categoryType?: string;
  thumbnail: string;
  images: string[];
  price: number;
  discountPrice: number | null;
  material: string | null;
  fit: string | null;
  style: string | null;
  tags: string[];
  sold: number;
  ratingAverage: number;
  totalReviews: number;
  status: ProductStatusType;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductQueryFilters {
  search?: string;
  categoryId?: string;
  categoryType?: string;
  status?: ProductStatusType;
  minPrice?: number;
  maxPrice?: number;
  colors?: string;
  sizes?: string;
  page?: number;
  limit?: number;
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
  status?: ProductStatusType;
  variants: ProductVariant[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

export interface ProductsListResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
