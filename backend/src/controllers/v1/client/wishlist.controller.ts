import { Response } from 'express';
import { WishlistService } from '../../../services/wishlist.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class ClientWishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Get user's wishlist with full product details
   */
  public get = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const wishlist = await this.wishlistService.getWishlist(userId);
    return sendResponse(res, 200, 'Lấy danh sách sản phẩm yêu thích thành công', { wishlist });
  });

  /**
   * Toggle product in user's wishlist
   */
  public toggle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      return sendResponse(res, 400, 'Vui lòng cung cấp productId');
    }

    const result = await this.wishlistService.toggleWishlist(userId, productId);
    return sendResponse(
      res,
      200,
      result.added ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích',
      result
    );
  });

  /**
   * Get user's wishlist product IDs only (useful for matching hearts on catalog page)
   */
  public getIds = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const productIds = await this.wishlistService.getWishlistIds(userId);
    return sendResponse(res, 200, 'Lấy danh sách ID yêu thích thành công', { productIds });
  });
}
