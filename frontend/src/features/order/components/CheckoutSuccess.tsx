import React, { useState } from 'react';
import { CheckCircle, QrCode, ShieldCheck, XCircle } from 'lucide-react';
import { SepayPaymentModal } from './SepayPaymentModal.js';

export interface CheckoutSuccessProps {
  order: any;
  onNavigateOrders: () => void;
  onNavigateHome: () => void;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  order,
  onNavigateOrders,
  onNavigateHome,
}) => {
  const isSepayUnpaid =
    order.paymentMethod === 'SEPAY' &&
    order.paymentStatus !== 'PAID' &&
    order.orderStatus !== 'CANCELLED';

  const [showPaymentModal, setShowPaymentModal] = useState(isSepayUnpaid);
  const [currentOrder, setCurrentOrder] = useState(order);

  const handlePaymentSuccess = () => {
    setCurrentOrder((prev: any) => ({
      ...prev,
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
    }));
  };

  const handleOrderCancelled = () => {
    setCurrentOrder((prev: any) => ({
      ...prev,
      orderStatus: 'CANCELLED',
    }));
  };

  const isCancelled = currentOrder.orderStatus === 'CANCELLED';
  const isPaid = currentOrder.paymentStatus === 'PAID';

  return (
    <div className="min-h-[80vh] bg-[#FAF8F5] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-brand-200/50 rounded-3xl p-8 md:p-12 text-center shadow-xs space-y-8">
        {isCancelled ? (
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <XCircle size={44} />
          </div>
        ) : (
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
            <CheckCircle size={44} />
          </div>
        )}

        <div className="space-y-3">
          <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-brand-950 tracking-wide">
            {isCancelled ? 'Đơn Hàng Đã Bị Hủy' : 'Đặt Hàng Thành Công!'}
          </h2>
          <p className="text-xs text-brand-550 font-light max-w-md mx-auto leading-relaxed">
            {isCancelled
              ? 'Đơn hàng của bạn đã tự động hủy do quá thời hạn thanh toán VietQR (10 phút). Số lượng sản phẩm đã được hoàn lại.'
              : currentOrder.paymentMethod === 'BLANC_PAY'
              ? 'Đơn hàng của bạn đã được thanh toán 100% qua Ví Blanc Pay và đang được xưởng chuẩn bị giao.'
              : currentOrder.paymentMethod === 'SEPAY'
              ? isPaid
                ? 'Đơn hàng của bạn đã được thanh toán thành công qua SePay và đang được chuẩn bị giao.'
                : 'Vui lòng hoàn tất chuyển khoản VietQR để đơn hàng được tự động xác nhận ngay lập tức.'
              : 'Cảm ơn bạn đã lựa chọn Seoul Blanc. Đơn hàng của bạn đã được tiếp nhận và đang chờ giao.'}
          </p>
        </div>

        {/* Sepay Payment Action banner if Unpaid & Not Cancelled */}
        {currentOrder.paymentMethod === 'SEPAY' && !isPaid && !isCancelled && (
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-900">Chưa hoàn tất thanh toán</span>
                <span className="px-2 py-0.5 bg-amber-200/60 text-amber-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} /> VietQR Tự động
                </span>
              </div>
              <p className="text-[11px] text-amber-700 font-light">
                Quét mã VietQR bằng app ngân hàng để hoàn tất thanh toán cho đơn hàng này.
              </p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-5 py-2.5 bg-brand-900 hover:bg-brand-850 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm flex-shrink-0"
            >
              <QrCode size={14} /> Mở mã VietQR
            </button>
          </div>
        )}

        {/* Order Brief Info */}
        <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-6 text-left space-y-4">
          <div className="flex justify-between border-b border-brand-150 pb-3 text-xs">
            <span className="text-brand-500 font-light">Mã đơn hàng</span>
            <span className="font-semibold text-brand-900">{currentOrder.orderCode}</span>
          </div>

          <div className="flex justify-between border-b border-brand-150 pb-3 text-xs">
            <span className="text-brand-500 font-light">Phương thức thanh toán</span>
            <span className="font-semibold text-brand-900">
              {currentOrder.paymentMethod === 'BLANC_PAY'
                ? 'Ví Blanc Pay (Trừ trực tiếp)'
                : currentOrder.paymentMethod === 'SEPAY'
                ? 'Chuyển khoản SePay (VietQR)'
                : 'Thanh toán khi nhận hàng (COD)'}
            </span>
          </div>

          <div className="flex justify-between border-b border-brand-150 pb-3 text-xs">
            <span className="text-brand-500 font-light">Trạng thái đơn hàng</span>
            <span
              className={`font-semibold ${
                isCancelled
                  ? 'text-red-600'
                  : currentOrder.orderStatus === 'CONFIRMED'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {isCancelled
                ? 'Đã hủy'
                : currentOrder.orderStatus === 'CONFIRMED'
                ? 'Đã xác nhận'
                : 'Chờ xác nhận'}
            </span>
          </div>

          <div className="flex justify-between border-b border-brand-150 pb-3 text-xs">
            <span className="text-brand-500 font-light">Trạng thái thanh toán</span>
            <span
              className={`font-semibold ${
                isPaid ? 'text-emerald-600' : isCancelled ? 'text-brand-400 line-through' : 'text-amber-600'
              }`}
            >
              {isPaid ? 'Đã thanh toán ✓' : 'Chưa thanh toán'}
            </span>
          </div>

          <div className="flex justify-between border-b border-brand-150 pb-3 text-xs items-baseline">
            <span className="text-brand-500 font-light">Tổng cộng thanh toán</span>
            <span className="font-editorial text-lg sm:text-xl font-normal text-brand-950">
              {currentOrder.totalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>

          <div className="text-xs space-y-1">
            <span className="text-brand-500 font-light block">Địa chỉ nhận hàng</span>
            <span className="text-brand-800 font-light leading-relaxed block">
              {currentOrder.shippingAddress}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isCancelled ? (
            <>
              <button
                onClick={() => {
                  window.location.href = '/cart';
                }}
                className="px-6 py-4 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={onNavigateHome}
                className="px-6 py-4 bg-white hover:bg-brand-50 border border-brand-300 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNavigateOrders}
                className="px-6 py-4 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Theo dõi đơn hàng
              </button>
              <button
                onClick={onNavigateHome}
                className="px-6 py-4 bg-white hover:bg-brand-50 border border-brand-300 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sepay Payment Modal */}
      {showPaymentModal && !isCancelled && !isPaid && (
        <SepayPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={currentOrder.id}
          orderCode={currentOrder.orderCode}
          totalPrice={currentOrder.totalPrice}
          createdAt={currentOrder.createdAt}
          initialSepayInfo={currentOrder.sepayPaymentInfo}
          onPaymentSuccess={handlePaymentSuccess}
          onOrderCancelled={handleOrderCancelled}
        />
      )}
    </div>
  );
};
