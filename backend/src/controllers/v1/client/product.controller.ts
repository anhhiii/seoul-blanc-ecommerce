import { Request, Response } from 'express';
import { ProductService } from '../../../services/product.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { ProductStatus, CategoryType, ColorEnum, SizeEnum } from '@prisma/client';
import { toProductDTO, toProductDTOs } from '../../../mappers/product.mapper.js';

export class ClientProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Get all active products (public view with search, filter, and pagination)
   */
  public getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = {
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      categoryType: req.query.categoryType as CategoryType | undefined,
      status: 'ACTIVE' as ProductStatus, // Only ACTIVE products are visible to clients
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      colors: req.query.colors ? (req.query.colors as string).split(',') as ColorEnum[] : undefined,
      sizes: req.query.sizes ? (req.query.sizes as string).split(',') as SizeEnum[] : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await this.productService.getAllProducts(filters);
    sendResponse(res, 200, 'Products fetched successfully', {
      products: toProductDTOs(result.products),
      pagination: result.pagination,
    });
  });

  /**
   * Get single product detail by ID or Slug
   */
  public getByIdOrSlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const idOrSlug = req.params.idOrSlug as string;
    const product = await this.productService.getProductById(idOrSlug);
    sendResponse(res, 200, 'Product fetched successfully', {
      product: toProductDTO(product),
    });
  });
}

export default ClientProductController;
