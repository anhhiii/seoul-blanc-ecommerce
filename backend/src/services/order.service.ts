import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';
import { OrderStatus } from '@prisma/client';
import { EmailService } from './email.service.js';

export class OrderService {
  /**
   * Client: Place a new order from current cart (COD only)
   */
  public createOrder = async (userId: string, addressId: string, note?: string, voucherCode?: string) => {
    // 1. Fetch User's Cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.');
    }

    // 2. Fetch User's Selected Address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Địa chỉ giao nhận không tồn tại.');
    }

    const shippingAddress = `${address.fullName} - ${address.phoneNumber} | ${address.detail}, ${address.ward}, ${address.district}, ${address.province}`;

    // 3. Check inventory and prepare items detail
    const itemsData = await Promise.all(
      cart.items.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true },
        });

        if (!variant || !variant.product || variant.product.status !== 'ACTIVE') {
          throw new BadRequestException(`Sản phẩm hoặc biến thể này hiện không còn hoạt động.`);
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${variant.product.name} (Màu: ${variant.color}, Size: ${variant.size}) không đủ hàng trong kho (Còn lại: ${variant.stock}).`
          );
        }

        return {
          variant,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );

    // 4. Update Inventory (Deduct stock)
    for (const itemData of itemsData) {
      await prisma.productVariant.update({
        where: { id: itemData.variant.id },
        data: {
          stock: {
            decrement: itemData.quantity,
          },
        },
      });
    }

    // 5. Calculate Costs (COD method) & Voucher discount
    const subtotal = cart.totalPrice;
    let discountAmount = 0;
    let appliedVoucher = null;

    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode.toUpperCase() },
      });
      if (!voucher || voucher.status !== 'ACTIVE') {
        throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new BadRequestException('Mã giảm giá không trong thời hạn áp dụng.');
      }
      if (voucher.usageCount >= voucher.usageLimit) {
        throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng.');
      }
      if (subtotal < voucher.minOrderValue) {
        throw new BadRequestException(`Đơn hàng từ ${voucher.minOrderValue.toLocaleString('vi-VN')}₫ mới được áp dụng mã này.`);
      }

      if (voucher.discountType === 'PERCENTAGE' || voucher.discountType === 'PERCENT') {
        discountAmount = (subtotal * voucher.discountValue) / 100;
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
      } else {
        discountAmount = voucher.discountValue;
      }

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
      appliedVoucher = voucher;
    }

    const shippingFee = subtotal >= 1000000 ? 0 : 30000;
    const total = Math.max(0, subtotal - discountAmount) + shippingFee;

    // Generate unique orderCode
    const orderCode = `SB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems = itemsData.map((d) => ({
      productVariantId: d.variant.id,
      productId: d.variant.productId,
      productName: d.variant.product.name,
      thumbnail: d.variant.product.thumbnail,
      quantity: d.quantity,
      size: d.variant.size,
      color: d.variant.color,
      price: d.price,
    }));

    // 6. Save Order
    const order = await prisma.order.create({
      data: {
        userId,
        orderCode,
        items: orderItems,
        totalPrice: total,
        shippingFee,
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        orderStatus: 'PENDING',
        shippingAddress,
        phoneNumber: address.phoneNumber,
        note,
        voucherCode: voucherCode ? voucherCode.toUpperCase() : null,
        discountAmount: discountAmount,
      },
    });

    // Increment voucher usage
    if (appliedVoucher) {
      await prisma.voucher.update({
        where: { id: appliedVoucher.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // 7. Clear User's Cart
    await prisma.cart.update({
      where: { userId },
      data: {
        items: [],
        totalPrice: 0.0,
      },
    });

    // Send order confirmation email in the background
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      EmailService.sendOrderConfirmation(
        user.email,
        orderCode,
        orderItems,
        total,
        shippingAddress
      ).catch((err) => console.error('Send order confirmation email failed:', err));
    }

    return order;
  };

  /**
   * Client: Fetch personal order history
   */
  public getMyOrders = async (userId: string) => {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  };

  /**
   * Client: Fetch order details
   */
  public getOrderDetails = async (userId: string, orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền truy cập đơn hàng này.');
    }

    return order;
  };

  /**
   * Helper to create a notification for client
   */
  private createNotification = async (userId: string, title: string, content: string) => {
    return prisma.notification.create({
      data: {
        userId,
        title,
        content,
      },
    });
  };

  /**
   * Client: Cancel a pending order
   */
  public cancelOrder = async (userId: string, orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền thực hiện hành động này.');
    }

    if (order.orderStatus !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng khi trạng thái là CHỜ XÁC NHẬN (PENDING).');
    }

    // Restore stocks
    for (const item of order.items) {
      await prisma.productVariant.update({
        where: { id: item.productVariantId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'CANCELLED',
      },
    });

    // Notify user
    await this.createNotification(
      userId,
      'Bạn đã hủy đơn hàng thành công',
      `Đơn hàng ${order.orderCode} của bạn đã được hủy thành công.`
    );

    return updated;
  };

  /**
   * Client: Request refund / return (Only if delivered successfully)
   */
  public refundOrder = async (userId: string, orderId: string, returnReason: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền thực hiện hành động này.');
    }

    if (order.orderStatus !== 'DELIVERED') {
      throw new BadRequestException('Chỉ có thể trả hàng hoàn tiền khi đơn hàng đã GIAO THÀNH CÔNG (DELIVERED).');
    }

    if (order.returnStatus === 'PENDING') {
      throw new BadRequestException('Yêu cầu trả hàng hoàn tiền của bạn đang chờ phê duyệt.');
    }

    if (order.returnStatus === 'APPROVED') {
      throw new BadRequestException('Yêu cầu trả hàng hoàn tiền của bạn đã được chấp nhận trước đó.');
    }

    // Save return request, wait for Admin approval
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        returnStatus: 'PENDING',
        returnReason,
      },
    });

    // Notify user
    await this.createNotification(
      userId,
      'Đã gửi yêu cầu trả hàng/hoàn tiền',
      `Yêu cầu trả hàng hoàn tiền cho đơn hàng ${order.orderCode} đã được gửi và đang chờ Admin xét duyệt.`
    );

    return updatedOrder;
  };

  /**
   * Admin: List all orders in system
   */
  public getAllOrdersAdmin = async () => {
    return prisma.order.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  };

  /**
   * Admin: Update order status with stock check and notification triggers
   */
  public updateOrderStatusAdmin = async (orderId: string, newStatus: OrderStatus) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    const oldStatus = order.orderStatus;
    if (oldStatus === newStatus) {
      return order;
    }

    // Manage Stock transitions
    const isOldLive = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(oldStatus);
    const isNewLive = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(newStatus);
    const isOldTerminated = ['CANCELLED', 'RETURNED'].includes(oldStatus);
    const isNewTerminated = ['CANCELLED', 'RETURNED'].includes(newStatus);

    if (isOldLive && isNewTerminated) {
      // Restore stocks
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    } else if (isOldTerminated && isNewLive) {
      // Re-deduct stocks
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    const dataToUpdate: any = {
      orderStatus: newStatus,
    };

    if (newStatus === 'DELIVERED') {
      dataToUpdate.paymentStatus = 'PAID';
    } else if (newStatus === 'RETURNED') {
      dataToUpdate.paymentStatus = 'REFUNDED';
      dataToUpdate.returnStatus = 'APPROVED';
    } else if (newStatus === 'CANCELLED') {
      dataToUpdate.paymentStatus = 'UNPAID';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: dataToUpdate,
    });

    // Send Notification to user
    let title = '';
    let content = '';

    switch (newStatus) {
      case 'CONFIRMED':
        title = 'Đơn hàng đã được xác nhận';
        content = `Đơn hàng ${order.orderCode} của bạn đã được Admin xác nhận thành công.`;
        break;
      case 'SHIPPING':
        title = 'Đơn hàng đang được giao';
        content = `Đơn hàng ${order.orderCode} của bạn đang được giao tới địa chỉ nhận hàng.`;
        break;
      case 'DELIVERED':
        title = 'Đơn hàng giao thành công';
        content = `Đơn hàng ${order.orderCode} của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm!`;
        break;
      case 'RETURNED':
        title = 'Đơn hàng trả hàng/hoàn tiền';
        content = `Yêu cầu hoàn trả cho đơn hàng ${order.orderCode} đã được hoàn tất thành công.`;
        break;
      case 'CANCELLED':
        title = 'Đơn hàng bị hủy';
        content = `Đơn hàng ${order.orderCode} của bạn đã bị hủy bởi Admin.`;
        break;
      default:
        break;
    }

    if (title && content) {
      await this.createNotification(order.userId, title, content);
    }

    // Trigger emails based on newStatus
    const customer = await prisma.user.findUnique({ where: { id: order.userId } });
    if (customer) {
      if (newStatus === 'SHIPPING') {
        EmailService.sendShippingUpdate(customer.email, order.orderCode).catch((err) =>
          console.error('Send shipping email failed:', err)
        );
      } else if (newStatus === 'RETURNED') {
        EmailService.sendReturnUpdate(customer.email, order.orderCode, true).catch((err) =>
          console.error('Send return email failed:', err)
        );
      }
    }

    return updatedOrder;
  };

  /**
   * Admin: Approve or Reject a return request
   */
  public handleReturnRequestAdmin = async (orderId: string, action: 'APPROVE' | 'REJECT') => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    if (order.orderStatus !== 'DELIVERED' || order.returnStatus !== 'PENDING') {
      throw new BadRequestException('Đơn hàng không ở trạng thái yêu cầu hoàn trả hợp lệ.');
    }

    if (action === 'APPROVE') {
      // Restore stocks
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'RETURNED',
          paymentStatus: 'REFUNDED',
          returnStatus: 'APPROVED',
        },
      });

      await this.createNotification(
        order.userId,
        'Yêu cầu trả hàng được phê duyệt',
        `Yêu cầu trả hàng/hoàn tiền cho đơn hàng ${order.orderCode} của bạn đã được Admin phê duyệt.`
      );

      const customer = await prisma.user.findUnique({ where: { id: order.userId } });
      if (customer) {
        EmailService.sendReturnUpdate(customer.email, order.orderCode, true).catch((err) =>
          console.error('Send return approve email failed:', err)
        );
      }

      return updated;
    } else {
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          returnStatus: 'REJECTED',
        },
      });

      await this.createNotification(
        order.userId,
        'Yêu cầu trả hàng bị từ chối',
        `Yêu cầu trả hàng/hoàn tiền cho đơn hàng ${order.orderCode} của bạn đã bị Admin từ chối.`
      );

      const customer = await prisma.user.findUnique({ where: { id: order.userId } });
      if (customer) {
        EmailService.sendReturnUpdate(customer.email, order.orderCode, false).catch((err) =>
          console.error('Send return reject email failed:', err)
        );
      }

      return updated;
    }
  };
}
