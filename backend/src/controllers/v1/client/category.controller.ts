import { Request, Response } from 'express';
import { CategoryService } from '../../../services/category.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { toCategoryDTO, toCategoryDTOs } from '../../../mappers/category.mapper.js';

export class ClientCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Get all categories handler (public endpoint)
   */
  public getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.categoryService.getAllCategories();
    return sendResponse(res, 200, 'Categories fetched successfully', {
      categories: toCategoryDTOs(categories),
    });
  });

  /**
   * Get category by ID handler (public endpoint)
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.getCategoryById(id);
    return sendResponse(res, 200, 'Category fetched successfully', {
      category: toCategoryDTO(category),
    });
  });
}

export default ClientCategoryController;
