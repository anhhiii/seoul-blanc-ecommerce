import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';
import { OrderStatus } from '@prisma/client';
import { EmailService, IEmailService } from '../shared/services/email.service.js';
import { settingService } from './setting.service.js';
import { walletService } from './wallet.service.js';

export class OrderService {
  constructor(private readonly emailService: IEmailService = new EmailService()) {}

  /**
   * Client: Place a new order from current cart (COD or SePay) or direct buy
   */
  public createOrder = async (
    userId: string,
    addressId: string,
    note?: string,
    voucherCode?: string,
    selectedVariantIds?: string[],
    directItem?: { productVariantId: string; quantity: number },
    paymentMethod: 'COD' | 'SEPAY' | 'BLANC_PAY' = 'COD',
    useWalletBalance: boolean = false
  ) => {
    let targetItems: Array<{ productVariantId: string; quantity: number; price?: number }> = [];
    const isDirectBuy = !!directItem;
    const selectedVariantSet = new Set(selectedVariantIds || []);

    if (isDirectBuy) {
      targetItems = [
        {
          productVariantId: directItem.productVariantId,
          quantity: directItem.quantity,
        },
      ];
    } else {
      // 1. Fetch User's Cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException(
          'Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.'
        );
      }

      // DSA Optimization: Use Set for O(1) membership lookup instead of O(M) Array.prototype.includes
      targetItems =
        selectedVariantSet.size > 0
          ? cart.items.filter((item) => selectedVariantSet.has(item.productVariantId))
          : cart.items;

      if (targetItems.length === 0) {
        throw new BadRequestException('Không tìm thấy sản phẩm hợp lệ trong giỏ hàng để đặt hàng.');
      }
    }

    // 2. Fetch User's Selected Address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Địa chỉ giao nhận không tồn tại.');
    }

    const shippingAddress = `${address.fullName} - ${address.phoneNumber} | ${address.detail}, ${address.ward}, ${address.district}, ${address.province}`;

    // 3. DSA Optimization: Batch query + Hash Map to resolve N+1 DB queries
    const variantIds = targetItems.map((item) => item.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantMap = new Map<string, (typeof variants)[0]>();
    for (const variant of variants) {
      variantMap.set(variant.id, variant);
    }

    const itemsData = targetItems.map((item) => {
      const variant = variantMap.get(item.productVariantId);

      if (!variant || !variant.product || variant.product.status !== 'ACTIVE') {
        throw new BadRequestException(`Sản phẩm hoặc biến thể này hiện không còn hoạt động.`);
      }

      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${variant.product.name} (Màu: ${variant.color}, Size: ${variant.size}) không đủ hàng trong kho (Còn lại: ${variant.stock}).`
        );
      }

      const itemPrice = item.price ?? (variant.product.discountPrice ?? variant.product.price);

      return {
        variant,
        quantity: item.quantity,
        price: itemPrice,
      };
    });

    // 4. Calculate Costs (COD method) & Voucher discount
    const subtotal = itemsData.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        throw new BadRequestException(
          `Đơn hàng từ ${voucher.minOrderValue.toLocaleString('vi-VN')}₫ mới được áp dụng mã này.`
        );
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

    const currentSettings = await settingService.getSettings();
    const shippingFee =
      subtotal >= currentSettings.freeShippingThreshold ? 0 : currentSettings.standardShippingFee;
    const total = Math.max(0, subtotal - discountAmount) + shippingFee;

    // Wallet deduction or Blanc Pay check
    let walletDeduct = 0;
    let finalPayAmount = total;
    let initialPaymentStatus: 'UNPAID' | 'PAID' = 'UNPAID';
    let initialOrderStatus: OrderStatus = 'PENDING';
    const isBlancPay = paymentMethod === 'BLANC_PAY';

    if (isBlancPay) {
      const userWallet = walletService.getWallet(userId);
      if (userWallet.balance < total) {
        throw new BadRequestException(
          `Số dư ví Blanc Pay (${userWallet.balance.toLocaleString('vi-VN')}₫) không đủ để thanh toán đơn hàng (${total.toLocaleString('vi-VN')}₫).`
        );
      }
      walletDeduct = total;
      initialPaymentStatus = 'PAID';
      initialOrderStatus = 'CONFIRMED';
    } else if (useWalletBalance) {
      const userWallet = walletService.getWallet(userId);
      if (userWallet.balance > 0) {
        walletDeduct = Math.min(userWallet.balance, total);
        finalPayAmount = Math.max(0, total - walletDeduct);
        if (finalPayAmount === 0) {
          initialPaymentStatus = 'PAID';
          initialOrderStatus = 'CONFIRMED';
        }
      }
    }

    // Generate unique, alphanumeric orderCode (suitable for bank transfer memo)
    const orderCode = `SB${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

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

    // 5. Execute DB updates inside an interactive transaction for data consistency
    const order = await prisma.$transaction(async (tx) => {
      // 5a. Deduct stock & increment product sold counter
      for (const itemData of itemsData) {
        await tx.productVariant.update({
          where: { id: itemData.variant.id },
          data: {
            stock: {
              decrement: itemData.quantity,
            },
          },
        });

        await tx.product.update({
          where: { id: itemData.variant.productId },
          data: {
            sold: {
              increment: itemData.quantity,
            },
          },
        });
      }

      const orderNote = isBlancPay
        ? note ? `${note} | [Ví Blanc Pay]` : '[Ví Blanc Pay]'
        : note;

      // 5b. Save Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderCode,
          items: orderItems,
          totalPrice: finalPayAmount,
          shippingFee,
          paymentMethod: isBlancPay ? 'SEPAY' : paymentMethod || 'COD',
          paymentStatus: initialPaymentStatus,
          orderStatus: initialOrderStatus,
          shippingAddress,
          phoneNumber: address.phoneNumber,
          note: orderNote,
          voucherCode: voucherCode ? voucherCode.toUpperCase() : null,
          discountAmount,
        },
      });

      // Debit wallet balance if deducted
      if (walletDeduct > 0) {
        walletService.debitWallet(
          userId,
          walletDeduct,
          newOrder.id,
          orderCode,
          `Thanh toán đơn hàng #${orderCode}`
        );
      }

      // 5c. Increment voucher usage
      if (appliedVoucher) {
        await tx.voucher.update({
          where: { id: appliedVoucher.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // 5d. Update Cart: only if order originated from cart (skip if direct buy)
      if (!isDirectBuy) {
        const cart = await tx.cart.findUnique({ where: { userId } });
        if (cart) {
          if (selectedVariantSet.size > 0) {
            const remainingItems = cart.items.filter(
              (item) => !selectedVariantSet.has(item.productVariantId)
            );
            const remainingTotal = remainingItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            await tx.cart.update({
              where: { userId },
              data: {
                items: remainingItems,
                totalPrice: remainingTotal,
              },
            });
          } else {
            await tx.cart.update({
              where: { userId },
              data: {
                items: [],
                totalPrice: 0.0,
              },
            });
          }
        }
      }

      return newOrder;
    });

    // Send order confirmation email in the background
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      this.emailService
        .sendOrderConfirmation(user.email, orderCode, orderItems, total, shippingAddress)
        .catch((err) => console.error('Send order confirmation email failed:', err));
    }

    const sepayPaymentInfo =
      paymentMethod === 'SEPAY' ? this.getSepayPaymentInfo(orderCode, total) : null;

    return this.formatOrder({
      ...order,
      sepayPaymentInfo,
    });
  };

  /**
   * Helper to format order for client (expose BLANC_PAY if flagged in note)
   */
  private formatOrder = (order: any) => {
    if (!order) return order;
    const isBlancPay = typeof order.note === 'string' && order.note.includes('[Ví Blanc Pay]');
    return {
      ...order,
      paymentMethod: isBlancPay ? 'BLANC_PAY' : order.paymentMethod,
    };
  };

  /**
   * Helper to generate SePay VietQR payment info
   */
  public getSepayPaymentInfo = (orderCode: string, total: number) => {
    const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
    const accountNumber = process.env.SEPAY_ACC_NUMBER || '0388888888';
    const accountName = process.env.SEPAY_ACC_NAME || 'SEOUL BLANC';
    const cleanDes = orderCode.replace(/[^a-zA-Z0-9]/g, '');
    const amount = Math.round(total);
    const qrCodeUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${accountNumber}&template=compact&amount=${amount}&des=${cleanDes}`;

    return {
      bankName,
      accountNumber,
      accountName,
      amount,
      description: cleanDes,
      qrCodeUrl,
    };
  };

  /**
   * Client: Fetch personal order history
   */
  public getMyOrders = async (userId: string) => {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.formatOrder(o));
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

    const sepayPaymentInfo =
      order.paymentMethod === 'SEPAY' && order.paymentStatus === 'UNPAID' && !order.note?.includes('[Ví Blanc Pay]')
        ? this.getSepayPaymentInfo(order.orderCode, order.totalPrice)
        : null;

    return this.formatOrder({
      ...order,
      sepayPaymentInfo,
    });
  };

  /**
   * Client: Check payment status via SePay Transaction List API (NO WEBHOOK)
   */
  public checkSePayPayment = async (userId: string, orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền truy cập đơn hàng này.');
    }

    // 1. If already paid, return early
    if (order.paymentStatus === 'PAID') {
      return {
        isPaid: true,
        order,
        message: 'Đơn hàng đã được thanh toán thành công!',
      };
    }

    // 2. Check if expired (over 10 minutes) and still PENDING -> Auto cancel order
    const orderCreatedAt = new Date(order.createdAt).getTime();
    const isExpired = Date.now() - orderCreatedAt > 10 * 60 * 1000;
    if (isExpired && order.orderStatus === 'PENDING') {
      const cancelledOrder = await this.cancelOrder(userId, orderId).catch(() => null);
      return {
        isPaid: false,
        isExpired: true,
        order: cancelledOrder || order,
        message: 'Đơn hàng đã quá hạn thời gian thanh toán (10 phút) và đã được tự động hủy.',
      };
    }

    const rawKey = process.env.SEPAY_API_KEY || '';
    const apiKey = rawKey.split('\n')[0].replace(/['"\r]/g, '').trim();
    if (!apiKey) {
      return {
        isPaid: false,
        order,
        unconfigured: true,
        message:
          'Chưa cấu hình SEPAY_API_KEY trong file .env trên server. Vui lòng thêm token API từ SePay.',
      };
    }

    try {
      // 2. Call SePay Transactions API (Supporting v2 API with Bearer token & fallback)
      const token = apiKey;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      let transactions: Array<{
        amount_in: string | number;
        transaction_content: string;
        code?: string | null;
      }> = [];

      // Endpoints to query: official v2 userapi first
      const endpoints = [
        'https://userapi.sepay.vn/v2/transactions?page=1&per_page=50',
        'https://my.sepay.vn/userapi/transactions/list?limit=50',
      ];

      let lastErrorStatus = 0;
      let lastErrorText = '';

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { method: 'GET', headers });
          if (res.ok) {
            const data = (await res.json()) as any;
            const list = data?.data || data?.transactions || [];
            if (Array.isArray(list) && list.length > 0) {
              transactions = list;
              break;
            } else if (Array.isArray(list)) {
              transactions = list;
            }
          } else {
            lastErrorStatus = res.status;
            lastErrorText = await res.text().catch(() => '');
            console.error(`SePay call to ${url} returned HTTP ${res.status}:`, lastErrorText);

            // If 401 with Bearer, try with Apikey prefix as fallback
            if (res.status === 401) {
              const resAlt = await fetch(url, {
                method: 'GET',
                headers: {
                  Authorization: `Apikey ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (resAlt.ok) {
                const dataAlt = (await resAlt.json()) as any;
                const listAlt = dataAlt?.data || dataAlt?.transactions || [];
                if (Array.isArray(listAlt)) {
                  transactions = listAlt;
                  break;
                }
              }
            }
          }
        } catch (fetchErr: any) {
          console.error(`SePay fetch error for ${url}:`, fetchErr?.message || fetchErr);
        }
      }

      if (transactions.length === 0 && lastErrorStatus !== 0 && lastErrorStatus !== 200) {
        return {
          isPaid: false,
          order,
          message: `Không thể kết nối đến hệ thống SePay (Mã lỗi ${lastErrorStatus}). Vui lòng kiểm tra lại API Key.`,
        };
      }

      // Clean target order code (e.g. "sb6092371105")
      const targetCode = order.orderCode.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if there is an incoming transaction matching the order
      const matchedTx = transactions.find((tx) => {
        const amountIn = parseFloat(String(tx.amount_in || 0));
        const content = (tx.transaction_content || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const txCode = (tx.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        const isAmountValid = amountIn >= Math.floor(order.totalPrice);
        const isContentMatched = content.includes(targetCode) || (txCode && txCode === targetCode);

        return isAmountValid && isContentMatched;
      });

      if (matchedTx) {
        // Update Order to PAID & CONFIRMED
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'CONFIRMED',
          },
        });

        // Send payment confirmation email in the background
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          this.emailService
            .sendOrderConfirmation(
              user.email,
              order.orderCode,
              order.items,
              order.totalPrice,
              order.shippingAddress
            )
            .catch((err) => console.error('Send payment confirmation email failed:', err));
        }

        return {
          isPaid: true,
          order: updatedOrder,
          message: 'Thanh toán SePay thành công! Đơn hàng của bạn đã được thanh toán và xác nhận.',
        };
      }

      return {
        isPaid: false,
        order,
        message: 'Hệ thống chưa tìm thấy giao dịch chuyển khoản cho đơn hàng này. Vui lòng kiểm tra lại sau ít phút!',
      };
    } catch (error: any) {
      console.error('Error checking SePay payment:', error);
      return {
        isPaid: false,
        order,
        message: 'Có lỗi xảy ra khi kiểm tra giao dịch với SePay. Vui lòng thử lại!',
      };
    }
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
      throw new BadRequestException(
        'Chỉ có thể hủy đơn hàng khi trạng thái là CHỜ XÁC NHẬN (PENDING).'
      );
    }

    // Restore stocks and sold counter
    for (const item of order.items) {
      await prisma.productVariant.update({
        where: { id: item.productVariantId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });

      if (item.productId) {
        await prisma.product
          .update({
            where: { id: item.productId },
            data: {
              sold: {
                decrement: item.quantity,
              },
            },
          })
          .catch(() => {});
      }
    }

    // Restore voucher usage if any
    if (order.voucherCode) {
      await prisma.voucher
        .updateMany({
          where: { code: order.voucherCode, usageCount: { gt: 0 } },
          data: { usageCount: { decrement: 1 } },
        })
        .catch(() => {});
    }

    const isPaid = order.paymentStatus === 'PAID';
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'CANCELLED',
        paymentStatus: isPaid ? 'REFUNDED' : order.paymentStatus,
      },
    });

    // Auto refund to user's wallet if the order was already paid
    if (isPaid && order.totalPrice > 0) {
      walletService.creditRefund(
        userId,
        order.totalPrice,
        order.id,
        order.orderCode,
        `Hoàn tiền do hủy đơn hàng #${order.orderCode}`,
        'REFUND_CANCEL'
      );
    }

    return updated;
  };

  /**
   * Client: Request refund / return (Only if delivered successfully)
   */
  public refundOrder = async (
    userId: string,
    orderId: string,
    returnReason: string,
    bankInfo?: { bankName?: string; accountNumber?: string; accountName?: string }
  ) => {
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
      throw new BadRequestException(
        'Chỉ có thể trả hàng hoàn tiền khi đơn hàng đã GIAO THÀNH CÔNG (DELIVERED).'
      );
    }

    if (order.returnStatus === 'PENDING') {
      throw new BadRequestException('Yêu cầu trả hàng hoàn tiền của bạn đang chờ phê duyệt.');
    }

    if (order.returnStatus === 'APPROVED') {
      throw new BadRequestException(
        'Yêu cầu trả hàng hoàn tiền của bạn đã được chấp nhận trước đó.'
      );
    }

    let finalReason = returnReason;
    if (bankInfo?.bankName && bankInfo?.accountNumber) {
      finalReason += ` | TK nhận hoàn tiền: ${bankInfo.bankName} - STK: ${bankInfo.accountNumber} (${bankInfo.accountName || ''})`;
    }

    // Save return request, wait for Admin approval
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        returnStatus: 'PENDING',
        returnReason: finalReason,
      },
    });

    return updatedOrder;
  };

  /**
   * Admin: List all orders in system
   */
  public getAllOrdersAdmin = async () => {
    const orders = await prisma.order.findMany({
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
    return orders.map((o) => this.formatOrder(o));
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
      // Restore stocks and sold counter
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });

        if (item.productId) {
          await prisma.product
            .update({
              where: { id: item.productId },
              data: { sold: { decrement: item.quantity } },
            })
            .catch(() => {});
        }
      }

      // Restore voucher usage count if cancelled/returned
      if (order.voucherCode) {
        await prisma.voucher
          .updateMany({
            where: { code: order.voucherCode, usageCount: { gt: 0 } },
            data: { usageCount: { decrement: 1 } },
          })
          .catch(() => {});
      }
    } else if (isOldTerminated && isNewLive) {
      // Re-deduct stocks and increment sold counter
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } },
        });

        if (item.productId) {
          await prisma.product
            .update({
              where: { id: item.productId },
              data: { sold: { increment: item.quantity } },
            })
            .catch(() => {});
        }
      }

      // Re-increment voucher usage
      if (order.voucherCode) {
        await prisma.voucher
          .updateMany({
            where: { code: order.voucherCode },
            data: { usageCount: { increment: 1 } },
          })
          .catch(() => {});
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

    // Trigger emails based on newStatus
    const customer = await prisma.user.findUnique({ where: { id: order.userId } });
    if (customer) {
      if (newStatus === 'SHIPPING') {
        this.emailService
          .sendShippingUpdate(customer.email, order.orderCode)
          .catch((err) => console.error('Send shipping email failed:', err));
      } else if (newStatus === 'RETURNED') {
        this.emailService
          .sendReturnUpdate(customer.email, order.orderCode, true)
          .catch((err) => console.error('Send return email failed:', err));
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
      // Restore stocks and sold counter
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });

        if (item.productId) {
          await prisma.product
            .update({
              where: { id: item.productId },
              data: { sold: { decrement: item.quantity } },
            })
            .catch(() => {});
        }
      }

      // Restore voucher usage count if returned
      if (order.voucherCode) {
        await prisma.voucher
          .updateMany({
            where: { code: order.voucherCode, usageCount: { gt: 0 } },
            data: { usageCount: { decrement: 1 } },
          })
          .catch(() => {});
      }

      const isPaid = order.paymentStatus === 'PAID';
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'RETURNED',
          paymentStatus: isPaid ? 'REFUNDED' : order.paymentStatus,
          returnStatus: 'APPROVED',
        },
      });

      // Auto refund to user's wallet if the order was paid
      if (isPaid && order.totalPrice > 0) {
        walletService.creditRefund(
          order.userId,
          order.totalPrice,
          order.id,
          order.orderCode,
          `Hoàn tiền trả hàng cho đơn hàng #${order.orderCode}`,
          'REFUND_RETURN'
        );
      }

      await this.createNotification(
        order.userId,
        'Yêu cầu trả hàng được phê duyệt',
        `Yêu cầu trả hàng/hoàn tiền cho đơn hàng ${order.orderCode} của bạn đã được Admin phê duyệt.`
      );

      const customer = await prisma.user.findUnique({ where: { id: order.userId } });
      if (customer) {
        this.emailService
          .sendReturnUpdate(customer.email, order.orderCode, true)
          .catch((err) => console.error('Send return approve email failed:', err));
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
        this.emailService
          .sendReturnUpdate(customer.email, order.orderCode, false)
          .catch((err) => console.error('Send return reject email failed:', err));
      }

      return updated;
    }
  };
}
