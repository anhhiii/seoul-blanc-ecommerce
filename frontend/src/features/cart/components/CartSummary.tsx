import React from 'react';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export interface CartSummaryProps {
  selectedCount: number;
  totalItemsCount: number;
  subtotal: number;
  shippingFee: number;
  finalTotal: number;
  freeShippingThreshold?: number;
  onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  selectedCount,
  totalItemsCount,
  subtotal,
  shippingFee,
  finalTotal,
  freeShippingThreshold = 1000000,
  onCheckout,
}) => {
  return (
    <div className="space-y-6">
      {/* Order Summary box */}
      <div className="bg-white border border-brand-200/25 rounded-3xl p-6 shadow-xs space-y-6">
        <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest pb-3 border-b border-brand-100">
          Tóm tắt đơn hàng
        </h3>

        {/* Selected count indicator */}
        <div className="flex items-center justify-between text-[10px] text-brand-500 font-light bg-brand-50/60 rounded-xl px-3 py-2.5 border border-brand-100/60">
          <span>Sản phẩm đã chọn</span>
          <span className="font-bold text-brand-800">
            {selectedCount} / {totalItemsCount}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs text-brand-600 font-light">
            <span>Tạm tính</span>
            <span className="font-semibold text-brand-900">{subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between text-xs text-brand-600 font-light">
            <span>Phí vận chuyển</span>
            <span className="font-semibold text-brand-900">
              {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
            </span>
          </div>

          {shippingFee > 0 && subtotal > 0 && (
            <div className="text-[10px] text-brand-500 font-light bg-brand-50/50 p-3 border border-brand-100 rounded-xl leading-normal flex items-start gap-2">
              <Truck size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                Mua thêm <strong>{Math.max(0, freeShippingThreshold - subtotal).toLocaleString('vi-VN')}₫</strong> để được miễn phí vận chuyển.
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-brand-150 pt-4 flex justify-between items-baseline">
          <span className="text-sm font-light text-brand-900">Tổng cộng</span>
          <span className="text-xl font-bold text-brand-900">
            {finalTotal.toLocaleString('vi-VN')}₫
          </span>
        </div>

        <button
          disabled={selectedCount === 0}
          onClick={onCheckout}
          className="w-full py-4 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck size={16} />
          Tiến hành thanh toán
          {selectedCount > 0 && (
            <span className="ml-1 text-[9px] font-semibold bg-white/20 rounded-full px-1.5 py-0.5">
              {selectedCount}
            </span>
          )}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="bg-brand-50/50 border border-brand-200/20 p-5 rounded-2xl space-y-4 text-xs font-light text-brand-600">
        <div className="flex gap-3">
          <ShieldCheck size={16} className="text-brand-500 mt-0.5" />
          <div>
            <strong className="font-semibold text-brand-900 block mb-0.5">Thanh toán bảo mật</strong>
            Mọi giao dịch đều được mã hóa bảo mật tối đa.
          </div>
        </div>
        <div className="flex gap-3">
          <Truck size={16} className="text-brand-500 mt-0.5" />
          <div>
            <strong className="font-semibold text-brand-900 block mb-0.5">Giao hàng nhanh chóng</strong>
            Nhận hàng từ 2 - 4 ngày làm việc trên toàn quốc.
          </div>
        </div>
        <div className="flex gap-3">
          <RefreshCw size={16} className="text-brand-500 mt-0.5" />
          <div>
            <strong className="font-semibold text-brand-900 block mb-0.5">Đổi trả dễ dàng</strong>
            Đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng.
          </div>
        </div>
      </div>
    </div>
  );
};

