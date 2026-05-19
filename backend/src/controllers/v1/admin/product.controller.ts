import { Request, Response } from 'express';
import { ProductService } from '../../../services/product.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { ProductStatus } from '@prisma/client';
import { toProductDTO, toProductDTOs } from '../../../mappers/product.mapper.js';

export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product
   */
  public create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.createProduct(req.body);
    sendResponse(res, 201, 'Product created successfully', {
      product: toProductDTO(product),
    });
  });

  /**
   * Get all products (admin views all with pagination/filters)
   */
  public getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = {
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      status: req.query.status as ProductStatus,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
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
   * Get product detail by ID
   */
  public getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const product = await this.productService.getProductById(id);
    sendResponse(res, 200, 'Product fetched successfully', {
      product: toProductDTO(product),
    });
  });

  /**
   * Update a product by ID
   */
  public update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const product = await this.productService.updateProduct(id, req.body);
    sendResponse(res, 200, 'Product updated successfully', {
      product: toProductDTO(product),
    });
  });

  /**
   * Delete a product by ID
   */
  public delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const result = await this.productService.deleteProduct(id);
    sendResponse(res, 200, result.message);
  });
}

export default AdminProductController;
