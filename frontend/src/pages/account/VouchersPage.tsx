import React from 'react';
import { Ticket } from 'lucide-react';

export const VouchersPage: React.FC = () => {
  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-8 text-center shadow-xs">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Ticket className="text-brand-400" size={28} />
      </div>
      <h2 className="text-lg font-light text-brand-900 tracking-wide mb-2">Ví voucher của bạn</h2>
      <p className="text-xs text-brand-500 font-light mb-4 leading-relaxed max-w-sm mx-auto">
        Danh sách các mã giảm giá, mã miễn phí vận chuyển dành riêng cho tài khoản của bạn.
      </p>
      <span className="text-[10px] text-brand-400 font-light italic">Hiện chưa có voucher nào khả dụng</span>
    </div>
  );
};

export default VouchersPage;
