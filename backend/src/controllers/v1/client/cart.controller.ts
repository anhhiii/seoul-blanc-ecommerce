import { Response } from 'express';
import { CartService } from '../../../services/cart.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class ClientCartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get or create cart for user
   */
  public get = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const cart = await this.cartService.getOrCreateCart(userId);
    return sendResponse(res, 200, 'Cart fetched successfully', { cart });
  });

  /**
   * Add item to cart
   */
  public add = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { productVariantId, quantity } = req.body;
    const cart = await this.cartService.addToCart(userId, productVariantId, quantity);
    return sendResponse(res, 200, 'Sản phẩm đã được thêm vào giỏ hàng', { cart });
  });

  /**
   * Update item quantity in cart
   */
  public update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const productVariantId = req.params.productVariantId as string;
    const { quantity } = req.body;
    const cart = await this.cartService.updateCartItem(userId, productVariantId, quantity);
    return sendResponse(res, 200, 'Cập nhật số lượng thành công', { cart });
  });

  /**
   * Remove item from cart
   */
  public remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const productVariantId = req.params.productVariantId as string;
    const cart = await this.cartService.removeFromCart(userId, productVariantId);
    return sendResponse(res, 200, 'Đã xóa sản phẩm khỏi giỏ hàng', { cart });
  });

  /**
   * Clear cart
   */
  public clear = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    await this.cartService.clearCart(userId);
    return sendResponse(res, 200, 'Đã xóa toàn bộ giỏ hàng', {
      cart: { items: [], totalPrice: 0 },
    });
  });
}

export default ClientCartController;
