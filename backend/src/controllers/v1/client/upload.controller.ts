import { Request, Response } from 'express';
import { UploadService } from '../../../shared/services/upload.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { BadRequestException } from '../../../exceptions/index.js';

export class ClientUploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload user avatar
   */
  public uploadAvatar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new BadRequestException('No image file provided');
    }

    const secureUrl = await this.uploadService.uploadImage(req.file.buffer, 'seoul-blanc/avatars');

    sendResponse(res, 200, 'Avatar uploaded successfully', { url: secureUrl });
  });
}

export default ClientUploadController;
