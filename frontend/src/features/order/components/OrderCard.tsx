import React, { useState } from 'react';
import { XCircle, RefreshCcw, MapPin, Calendar, Star, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Order, OrderStatus, PaymentStatus } from '../types/index.js';
import { SepayPaymentModal } from './SepayPaymentModal.js';

export interface OrderCardProps {
  order: Order;
  onCancelOrder: (orderId: string, orderCode: string) => void;
  onRefundOrder: (orderId: string, orderCode: string, totalPrice?: number) => void;
  onOpenReviewModal: (productId: string, productName: string) => void;
  isCancelling?: boolean;
}

export const getOrderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full font-medium text-[10px] tracking-wide border border-amber-200/50">Chờ xác nhận</span>;
    case 'CONFIRMED':
      return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-medium text-[10px] tracking-wide border border-blue-200/50">Đã xác nhận</span>;
    case 'SHIPPING':
      return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium text-[10px] tracking-wide border border-indigo-200/50">Đang giao hàng</span>;
    case 'DELIVERED':
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium text-[10px] tracking-wide border border-emerald-200/50">Đã giao</span>;
    case 'RETURNED':
      return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full font-medium text-[10px] tracking-wide border border-purple-200/50">Trả hàng/Hoàn tiền</span>;
    case 'CANCELLED':
      return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-medium text-[10px] tracking-wide border border-red-200/50">Đã hủy</span>;
    default:
      return null;
  }
};

export const getPaymentStatusBadge = (status: PaymentStatus, method?: string) => {
  const methodLabel =
    method === 'BLANC_PAY' ? 'Ví Blanc Pay' : method === 'SEPAY' ? 'SePay' : 'COD';
  switch (status) {
    case 'UNPAID':
      return (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-semibold border border-amber-200/40">
          Chưa thanh toán ({methodLabel})
        </span>
      );
    case 'PAID':
      return (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-semibold border border-emerald-200/40">
          Đã thanh toán ({methodLabel})
        </span>
      );
    case 'FAILED':
      return <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[9px] font-semibold border border-red-200/40">Thanh toán thất bại</span>;
    case 'REFUNDED':
      return (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-semibold border border-emerald-200/50">
          Đã hoàn tiền về Ví Blanc Pay
        </span>
      );
    default:
      return null;
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancelOrder,
  onRefundOrder,
  onOpenReviewModal,
  isCancelling = false,
}) => {
  const [showSepayModal, setShowSepayModal] = useState(false);

  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Order Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-brand-900 tracking-wider">
              #{order.orderCode}
            </span>
            {getOrderStatusBadge(order.orderStatus)}
            {getPaymentStatusBadge(order.paymentStatus, order.paymentMethod)}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-brand-400 font-light">
            <Calendar size={12} />
            <span>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Action Buttons: Pay VietQR, Cancel, Refund */}
        <div className="flex items-center gap-2">
          {order.paymentMethod === 'SEPAY' &&
            order.paymentStatus === 'UNPAID' &&
            order.orderStatus !== 'CANCELLED' && (
              <button
                onClick={() => setShowSepayModal(true)}
                className="px-3.5 py-1.5 bg-brand-900 hover:bg-brand-850 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <QrCode size={12} />
                Thanh toán VietQR
              </button>
            )}

          {order.orderStatus === 'PENDING' && (
            <button
              onClick={() => onCancelOrder(order.id, order.orderCode)}
              disabled={isCancelling}
              className="px-3.5 py-1.5 border border-red-200 hover:border-red-400 bg-red-50/30 text-red-600 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle size={12} />
              Hủy đơn
            </button>
          )}

          {order.orderStatus === 'DELIVERED' && (
            <button
              onClick={() => onRefundOrder(order.id, order.orderCode, order.totalPrice)}
              className="px-3.5 py-1.5 border border-purple-200 hover:border-purple-400 bg-purple-50/40 text-purple-700 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw size={12} />
              Yêu cầu hoàn trả
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {order.items?.map((item, idx) => (
          <div key={item.productVariantId || idx} className="flex gap-4 items-center">
            <Link
              to={item.productId ? `/products/${item.productId}` : '#'}
              className="w-14 h-16 bg-brand-50 rounded-xl overflow-hidden flex-shrink-0 border border-brand-100"
            >
              <img
                src={item.thumbnail || '/placeholder.jpg'}
                alt={item.productName || 'Sản phẩm'}
                className="w-full h-full object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0 text-xs">
              <Link
                to={item.productId ? `/products/${item.productId}` : '#'}
                className="font-light text-brand-900 truncate block hover:text-brand-650 transition-colors"
              >
                {item.productName || 'Seoul Blanc Luxury Apparel'}
              </Link>
              <div className="flex flex-wrap gap-x-2 text-[10px] text-brand-500 font-light mt-1">
                <span>Màu: {item.color}</span>
                <span>•</span>
                <span>Size: {item.size}</span>
                <span>•</span>
                <span>SL: {item.quantity}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <div className="text-xs font-semibold text-brand-900">
                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
              </div>

              {/* Review button if delivered */}
              {order.orderStatus === 'DELIVERED' && item.productId && (
                <button
                  onClick={() => onOpenReviewModal(item.productId!, item.productName)}
                  className="px-2 py-0.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-[9px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  Đánh giá
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refund Notice Banner if REFUNDED */}
      {order.paymentStatus === 'REFUNDED' && (
        <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tiền hoàn đã được chuyển vào <strong>Số dư tài khoản</strong> của bạn:</span>
          </div>
          <span className="font-bold text-emerald-700 text-sm">
            +{order.totalPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
      )}

      {/* Order Footer: Address & Price */}
      <div className="bg-brand-50/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div className="flex items-start gap-2 max-w-md">
          <MapPin size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-brand-600 font-light leading-relaxed">
            {order.shippingAddress}
          </span>
        </div>

        <div className="flex items-baseline gap-2 self-end sm:self-center">
          <span className="text-brand-500 font-light text-[11px]">Tổng số tiền:</span>
          <span className="font-editorial text-xl font-normal text-brand-950">
            {order.totalPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

      {/* Sepay Modal */}
      {showSepayModal && (
        <SepayPaymentModal
          isOpen={showSepayModal}
          onClose={() => setShowSepayModal(false)}
          orderId={order.id}
          orderCode={order.orderCode}
          totalPrice={order.totalPrice}
          createdAt={order.createdAt}
          initialSepayInfo={order.sepayPaymentInfo}
        />
      )}
    </div>
  );
};
