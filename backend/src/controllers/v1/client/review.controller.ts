import { Response } from 'express';
import { ReviewService } from '../../../services/review.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class ClientReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Create or update product review
   */
  public create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { productId, rating, comment } = req.body;

    if (!productId || typeof rating !== 'number') {
      return sendResponse(res, 400, 'Vui lòng cung cấp đầy đủ productId và rating (số sao)');
    }

    if (rating < 1 || rating > 5) {
      return sendResponse(res, 400, 'Điểm số sao phải từ 1 đến 5');
    }

    try {
      const review = await this.reviewService.createReview(userId, productId, rating, comment);
      return sendResponse(res, 201, 'Gửi đánh giá sản phẩm thành công', { review });
    } catch (error: any) {
      return sendResponse(res, 400, error.message || 'Không thể tạo đánh giá');
    }
  });

  /**
   * Get reviews by productId
   */
  public getByProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.params;

    if (!productId) {
      return sendResponse(res, 400, 'Vui lòng cung cấp productId');
    }

    const reviews = await this.reviewService.getProductReviews(productId as string);
    return sendResponse(res, 200, 'Lấy danh sách đánh giá thành công', { reviews });
  });
}
