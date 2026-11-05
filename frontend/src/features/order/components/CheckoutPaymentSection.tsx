import React from 'react';
import { CreditCard, ShieldCheck, Wallet, Sparkles } from 'lucide-react';

interface CheckoutPaymentSectionProps {
  paymentMethod: 'COD' | 'SEPAY' | 'BLANC_PAY';
  onSelectPaymentMethod: (method: 'COD' | 'SEPAY' | 'BLANC_PAY') => void;
  walletBalance?: number;
  grandTotal?: number;
}

export const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({
  paymentMethod,
  onSelectPaymentMethod,
  walletBalance = 0,
  grandTotal = 0,
}) => {
  const isWalletEligible = walletBalance >= grandTotal && grandTotal > 0;

  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-4 border-b border-brand-100">
        <CreditCard size={18} className="text-brand-900" />
        <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
          Phương thức thanh toán
        </h2>
      </div>

      <div className="space-y-3">
        {/* Blanc Pay Option */}
        <div
          onClick={() => {
            if (isWalletEligible) {
              onSelectPaymentMethod('BLANC_PAY');
            }
          }}
          className={`p-4 border rounded-2xl flex items-start gap-4 transition-all ${
            !isWalletEligible
              ? 'opacity-60 bg-brand-50/20 border-brand-150 cursor-not-allowed'
              : paymentMethod === 'BLANC_PAY'
              ? 'border-brand-900 bg-brand-50/40 ring-1 ring-brand-900 cursor-pointer shadow-xs'
              : 'border-brand-200/60 hover:border-brand-300 bg-white cursor-pointer'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
              paymentMethod === 'BLANC_PAY'
                ? 'bg-brand-900 border-brand-900 text-white'
                : 'border-brand-300 bg-white'
            }`}
          >
            {paymentMethod === 'BLANC_PAY' && <span className="text-[9px] font-bold">✓</span>}
          </div>
          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-brand-900 text-brand-100 flex items-center justify-center">
                  <Wallet size={12} />
                </div>
                <strong className="font-bold text-brand-950 font-editorial tracking-wide text-sm">
                  Ví Blanc Pay
                </strong>
                <span className="px-2 py-0.5 bg-brand-900 text-brand-100 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <Sparkles size={9} /> Trừ ngay 100%
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isWalletEligible
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                Số dư: {walletBalance.toLocaleString('vi-VN')}₫
              </span>
            </div>
            <p className="text-brand-600 font-light leading-relaxed">
              Thanh toán tức thì trừ trực tiếp từ số dư Ví Blanc Pay của bạn mà không cần chuyển khoản ngân hàng.
            </p>
            {!isWalletEligible && (
              <p className="text-[11px] text-amber-600 italic">
                * Số dư ví hiện tại không đủ thanh toán tổng đơn ({grandTotal.toLocaleString('vi-VN')}₫). Vui lòng chọn SePay hoặc COD.
              </p>
            )}
          </div>
        </div>

        {/* SePay Option */}
        <div
          onClick={() => onSelectPaymentMethod('SEPAY')}
          className={`p-4 border rounded-2xl flex items-start gap-4 cursor-pointer transition-all ${
            paymentMethod === 'SEPAY'
              ? 'border-brand-900 bg-brand-50/30 ring-1 ring-brand-900 shadow-xs'
              : 'border-brand-200/60 hover:border-brand-300 bg-white'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
              paymentMethod === 'SEPAY'
                ? 'bg-brand-900 border-brand-900 text-white'
                : 'border-brand-300 bg-white'
            }`}
          >
            {paymentMethod === 'SEPAY' && <span className="text-[9px] font-bold">✓</span>}
          </div>
          <div className="text-xs space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <strong className="font-bold text-brand-900">Chuyển khoản SePay (VietQR)</strong>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full flex items-center gap-1">
                <ShieldCheck size={10} /> Tự động xác nhận
              </span>
            </div>
            <p className="text-brand-600 font-light leading-relaxed">
              Quét mã VietQR bằng ứng dụng ngân hàng hoặc ví điện tử bất kỳ. Hệ thống tự động xác nhận thanh toán trong 3 giây.
            </p>
          </div>
        </div>

        {/* COD Option */}
        <div
          onClick={() => onSelectPaymentMethod('COD')}
          className={`p-4 border rounded-2xl flex items-start gap-4 cursor-pointer transition-all ${
            paymentMethod === 'COD'
              ? 'border-brand-900 bg-brand-50/30 ring-1 ring-brand-900 shadow-xs'
              : 'border-brand-200/60 hover:border-brand-300 bg-white'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
              paymentMethod === 'COD'
                ? 'bg-brand-900 border-brand-900 text-white'
                : 'border-brand-300 bg-white'
            }`}
          >
            {paymentMethod === 'COD' && <span className="text-[9px] font-bold">✓</span>}
          </div>
          <div className="text-xs space-y-1 flex-1">
            <strong className="font-bold text-brand-900 block">Thanh toán khi nhận hàng (COD)</strong>
            <p className="text-brand-600 font-light leading-relaxed">
              Nhận hàng, kiểm tra sản phẩm và thanh toán bằng tiền mặt trực tiếp cho shipper khi nhận hàng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
