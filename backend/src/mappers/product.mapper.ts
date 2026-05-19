import { Product, ProductVariant, Category } from '@prisma/client';

export interface ProductVariantDTO {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface ProductDTO {
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
  status: string;
  variants?: ProductVariantDTO[];
  createdAt: Date;
}

export const toProductVariantDTO = (variant: ProductVariant): ProductVariantDTO => {
  return {
    id: variant.id,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    sku: variant.sku,
  };
};

export type ProductWithRelations = Product & {
  variants?: ProductVariant[];
  category?: Category;
};

export const toProductDTO = (product: ProductWithRelations): ProductDTO => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId,
    categoryName: product.category?.name,
    categorySlug: product.category?.slug,
    categoryType: product.category?.type,
    thumbnail: product.thumbnail,
    images: product.images,
    price: product.price,
    discountPrice: product.discountPrice,
    material: product.material,
    fit: product.fit,
    style: product.style,
    tags: product.tags,
    sold: product.sold,
    ratingAverage: product.ratingAverage,
    totalReviews: product.totalReviews,
    status: product.status,
    variants: product.variants?.map(toProductVariantDTO),
    createdAt: product.createdAt,
  };
};

export const toProductDTOs = (products: ProductWithRelations[]): ProductDTO[] => {
  return products.map(toProductDTO);
};
