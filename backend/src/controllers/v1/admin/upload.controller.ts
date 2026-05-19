import { Request, Response } from 'express';
import { UploadService } from '../../../shared/services/upload.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { BadRequestException } from '../../../exceptions/index.js';

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload single image
   */
  public uploadSingle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestException('No image file provided');
    }

    const secureUrl = await this.uploadService.uploadImage(req.file.buffer, 'seoul-blanc/products');

    sendResponse(res, 200, 'Image uploaded successfully', { url: secureUrl });
  });

  /**
   * Upload multiple images
   */
  public uploadMultiple = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const buffers = files.map((file) => file.buffer);
    const secureUrls = await this.uploadService.uploadMultipleImages(
      buffers,
      'seoul-blanc/products'
    );

    sendResponse(res, 200, 'Images uploaded successfully', { urls: secureUrls });
  });
}

export default UploadController;
