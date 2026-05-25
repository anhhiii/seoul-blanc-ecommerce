import { Response } from 'express';
import { OrderService } from '../../../services/order.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

export class ClientOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Place an order
   */
  public create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { addressId, note } = req.body;
    const order = await this.orderService.createOrder(userId, addressId, note);
    return sendResponse(res, 201, 'Đặt hàng thành công', { order });
  });

  /**
   * Get my orders
   */
  public getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const orders = await this.orderService.getMyOrders(userId);
    return sendResponse(res, 200, 'Lấy danh sách đơn hàng thành công', { orders });
  });

  /**
   * Get order detail
   */
  public getOrderDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.id as string;
    const order = await this.orderService.getOrderDetails(userId, orderId);
    return sendResponse(res, 200, 'Lấy chi tiết đơn hàng thành công', { order });
  });

  /**
   * Cancel my order
   */
  public cancel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.id as string;
    const order = await this.orderService.cancelOrder(userId, orderId);
    return sendResponse(res, 200, 'Hủy đơn hàng thành công', { order });
  });

  /**
   * Request refund/return of a delivered order
   */
  public refund = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const orderId = req.params.id as string;
    const { returnReason } = req.body;
    const order = await this.orderService.refundOrder(userId, orderId, returnReason || 'Không có lý do cụ thể');
    return sendResponse(res, 200, 'Gửi yêu cầu trả hàng/hoàn tiền thành công', { order });
  });
}

export default ClientOrderController;
