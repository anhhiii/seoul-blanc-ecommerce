import React from 'react';
import { MessageSquare, X, Wallet, Sparkles, CheckCircle2 } from 'lucide-react';

export interface OrderRefundModalProps {
  isOpen: boolean;
  orderCode: string;
  orderPrice?: number;
  reasonText: string;
  onChangeReason: (val: string) => void;
  onSubmit: (bankInfo?: { bankName: string; accountNumber: string; accountName: string }) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export const OrderRefundModal: React.FC<OrderRefundModalProps> = ({
  isOpen,
  orderCode,
  orderPrice,
  reasonText,
  onChangeReason,
  onSubmit,
  onClose,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-brand-200/60 space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">
                Yêu cầu trả hàng & hoàn tiền #{orderCode}
              </h3>
              <p className="text-[11px] text-brand-400 font-light">
                Hoàn tiền tức thì vào Ví Blanc Pay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-400 hover:text-brand-700 cursor-pointer p-1.5 rounded-full hover:bg-brand-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Refund Amount Banner */}
        {orderPrice && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-150 flex items-center justify-center text-emerald-800">
                <Wallet size={18} />
              </div>
              <div>
                <span className="text-[11px] text-emerald-800 font-medium block">
                  Số tiền hoàn trả:
                </span>
                <span className="text-lg font-bold text-emerald-700 font-editorial tracking-wide">
                  {orderPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-800 font-semibold px-2.5 py-1 bg-white/80 border border-emerald-200 rounded-full flex items-center gap-1">
              <Sparkles size={10} /> 100% về Ví Blanc
            </span>
          </div>
        )}

        {/* Return Reason Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-brand-800 block">
            Lý do trả hàng / hoàn tiền <span className="text-red-500">*</span>:
          </label>
          <textarea
            rows={3}
            value={reasonText}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Ví dụ: Sản phẩm bị lỗi đường may, không vừa size, chất liệu không giống mô tả..."
            className="w-full text-xs p-3.5 border border-brand-200 rounded-xl focus:outline-none focus:border-brand-600 resize-none font-light text-brand-900 bg-brand-50/20"
          />
        </div>

        {/* Notice of Automatic Refund to Wallet */}
        <div className="border border-brand-150 rounded-2xl p-4 bg-[#FAF8F5] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-900">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Chính sách hoàn tiền tiện lợi:</span>
          </div>
          <p className="text-[11px] text-brand-600 font-light leading-relaxed">
            Bạn <strong>không cần nhập số tài khoản ngân hàng</strong>. Số tiền hoàn trả sẽ được tự động cộng trực tiếp 100% vào <strong>Ví Blanc Pay</strong> của bạn ngay khi yêu cầu hoàn hàng được phê duyệt. Bạn có thể kiểm tra số dư ví ở thanh menu trên cùng hoặc tại trang Hồ sơ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-brand-200 rounded-xl text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reasonText.trim()}
            className="px-6 py-2.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Wallet size={14} />
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu hoàn về Ví'}
          </button>
        </div>
      </div>
    </div>
  );
};
