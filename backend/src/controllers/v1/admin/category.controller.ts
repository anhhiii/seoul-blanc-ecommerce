import { Request, Response } from 'express';
import { CategoryService } from '../../../services/category.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { toCategoryDTO, toCategoryDTOs } from '../../../mappers/category.mapper.js';

export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create category handler
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.createCategory(req.body);
    return sendResponse(res, 201, 'Category created successfully', {
      category: toCategoryDTO(category),
    });
  });

  /**
   * Get all categories handler
   */
  public getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.categoryService.getAllCategories();
    return sendResponse(res, 200, 'Categories fetched successfully', {
      categories: toCategoryDTOs(categories),
    });
  });

  /**
   * Get category by ID handler
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.getCategoryById(id);
    return sendResponse(res, 200, 'Category fetched successfully', {
      category: toCategoryDTO(category),
    });
  });

  /**
   * Update category handler
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.updateCategory(id, req.body);
    return sendResponse(res, 200, 'Category updated successfully', {
      category: toCategoryDTO(category),
    });
  });

  /**
   * Delete category handler
   */
  public delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await this.categoryService.deleteCategory(id);
    return sendResponse(res, 200, result.message);
  });
}

export default AdminCategoryController;
