export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'COD' | 'STRIPE' | 'VNPAY' | 'SEPAY' | 'BLANC_PAY';

export interface SepayPaymentInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  qrCodeUrl: string;
}

export interface OrderItem {
  productVariantId: string;
  productId?: string;
  productName: string;
  thumbnail: string;
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL';
  color: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: {
    fullName: string;
    email: string;
  };
  orderCode: string;
  items: OrderItem[];
  totalPrice: number;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: string;
  phoneNumber: string;
  note?: string;
  returnReason?: string;
  returnStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  voucherCode?: string;
  discountAmount?: number;
  sepayPaymentInfo?: SepayPaymentInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}

export interface OrderListResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
  };
}
