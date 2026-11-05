import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

export interface CheckoutItem {
  productVariantId: string;
  quantity: number;
  price: number;
  variant?: any;
}

export interface CheckoutOrderSummaryProps {
  items: CheckoutItem[];
  voucherCodeInput: string;
  onChangeVoucherCode: (code: string) => void;
  onApplyVoucher: () => void;
  onRemoveVoucher: () => void;
  appliedVoucher: { code: string; discountAmount: number } | null;
  isVerifyingVoucher: boolean;
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
  walletDeduction?: number;
  freeShippingThreshold?: number;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
  hasAddresses: boolean;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  voucherCodeInput,
  onChangeVoucherCode,
  onApplyVoucher,
  onRemoveVoucher,
  appliedVoucher,
  isVerifyingVoucher,
  subtotal,
  shippingFee,
  grandTotal,
  walletDeduction = 0,
  freeShippingThreshold = 1000000,
  onPlaceOrder,
  isSubmitting,
  hasAddresses,
}) => {
  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-6">
        <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest pb-3 border-b border-brand-100">
          Đơn hàng của bạn ({items.length})
        </h2>

        {/* Items List */}
        <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
          {items.map((item) => {
            const product = item.variant?.product;
            return (
              <div key={item.productVariantId} className="flex gap-4 items-center">
                <div className="w-14 h-16 bg-brand-50 rounded-xl overflow-hidden flex-shrink-0 border border-brand-100">
                  <img
                    src={product?.thumbnail || item.variant?.product?.thumbnail || '/placeholder.jpg'}
                    alt={product?.name || 'Sản phẩm'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-light text-brand-900 truncate mb-0.5">
                    {product?.name || 'Seoul Blanc Luxury Apparel'}
                  </h4>
                  <div className="flex flex-wrap gap-x-2 text-[10px] text-brand-500 font-light">
                    <span>Màu: {item.variant?.color}</span>
                    <span>•</span>
                    <span>Size: {item.variant?.size}</span>
                    <span>•</span>
                    <span>SL: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-brand-900 flex-shrink-0 text-right">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </div>
              </div>
            );
          })}
        </div>

        {/* Voucher Application Field */}
        <div className="border-t border-brand-100 pt-4 space-y-2">
          <label className="text-[10px] font-bold text-brand-850 uppercase tracking-widest block">
            Mã giảm giá / Coupon
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="NHẬP MÃ GIẢM GIÁ"
              value={voucherCodeInput}
              onChange={(e) => onChangeVoucherCode(e.target.value)}
              disabled={!!appliedVoucher || isVerifyingVoucher}
              className="flex-1 px-3.5 py-2.5 text-xs uppercase tracking-wider rounded-xl bg-brand-50/20 border border-brand-200 text-brand-900 focus:outline-none focus:border-brand-400 placeholder:text-brand-350 disabled:bg-brand-50 disabled:text-brand-400 font-semibold"
            />
            <button
              type="button"
              onClick={onApplyVoucher}
              disabled={!!appliedVoucher || isVerifyingVoucher || !voucherCodeInput.trim()}
              className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-brand-900 hover:bg-brand-800 disabled:bg-brand-300 text-white rounded-xl transition-all cursor-pointer"
            >
              {isVerifyingVoucher ? '...' : 'Áp dụng'}
            </button>
          </div>
        </div>

        {/* Cost Calculation */}
        <div className="border-t border-brand-100 pt-4 space-y-3">
          <div className="flex justify-between text-xs text-brand-650 font-light">
            <span>Tạm tính</span>
            <span className="font-semibold text-brand-900">{subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          {appliedVoucher && (
            <div className="flex justify-between text-xs text-emerald-600 font-light">
              <span className="flex items-center gap-1.5">
                <span>Mã giảm giá ({appliedVoucher.code})</span>
                <button
                  type="button"
                  onClick={onRemoveVoucher}
                  className="text-[10px] text-red-500 underline hover:text-red-700 cursor-pointer font-normal border-none bg-transparent p-0"
                >
                  Gỡ bỏ
                </button>
              </span>
              <span className="font-semibold">-{(appliedVoucher.discountAmount || 0).toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          {walletDeduction > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-light">
              <span>Trừ số dư tài khoản</span>
              <span className="font-semibold">-{walletDeduction.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-brand-650 font-light">
            <span>Phí vận chuyển</span>
            <span className="font-semibold text-brand-900">
              {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
            </span>
          </div>

          {shippingFee > 0 && (
            <div className="text-[10px] text-brand-500 font-light bg-brand-50/50 p-3 border border-brand-100 rounded-xl leading-normal flex items-start gap-2">
              <Truck size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                Đặt thêm <strong>{Math.max(0, freeShippingThreshold - subtotal).toLocaleString('vi-VN')}₫</strong> để nhận ưu đãi miễn phí vận chuyển.
              </span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="border-t border-brand-150 pt-4 flex justify-between items-baseline">
          <span className="text-sm font-light text-brand-900">Tổng cộng</span>
          <span className="text-xl font-bold text-brand-950">
            {grandTotal.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Submit Button */}
        <button
          disabled={isSubmitting || !hasAddresses}
          onClick={onPlaceOrder}
          className="w-full py-4.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý đơn hàng...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Xác nhận đặt hàng
            </>
          )}
        </button>
      </div>

      {/* Trust note */}
      <div className="text-[11px] text-brand-500 font-light leading-relaxed text-center max-w-xs mx-auto">
        Bằng việc xác nhận đặt hàng, bạn đồng ý với Điều khoản mua sắm và Chính sách vận chuyển của Seoul Blanc.
      </div>
    </div>
  );
};

