import { Response, Request } from 'express';
import { OrderService } from '../../../services/order.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';

export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Get all orders in system (Admin)
   */
  public getAll = asyncHandler(async (req: Request, res: Response) => {
    const orders = await this.orderService.getAllOrdersAdmin();
    return sendResponse(res, 200, 'Lấy toàn bộ đơn hàng thành công', { orders });
  });

  /**
   * Update order status (Admin)
   */
  public updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id as string;
    const { status } = req.body;
    const order = await this.orderService.updateOrderStatusAdmin(orderId, status);
    return sendResponse(res, 200, 'Cập nhật trạng thái đơn hàng thành công', { order });
  });

  /**
   * Approve or reject return/refund request (Admin)
   */
  public handleReturnRequest = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id as string;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const order = await this.orderService.handleReturnRequestAdmin(orderId, action);
    return sendResponse(res, 200, `Đã ${action === 'APPROVE' ? 'chấp nhận' : 'từ chối'} yêu cầu trả hàng`, { order });
  });
}

export default AdminOrderController;
