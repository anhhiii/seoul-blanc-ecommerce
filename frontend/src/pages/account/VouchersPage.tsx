import React from 'react';
import { Ticket, Copy, Calendar, Award } from 'lucide-react';
import { useVoucher } from '../../features/voucher/hooks/useVoucher.js';
import { toast } from 'sonner';

export const VouchersPage: React.FC = () => {
  const { useGetActiveVouchers } = useVoucher();
  const { data: vouchers = [], isLoading } = useGetActiveVouchers();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code} 🎟️`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-brand-200/40 rounded-3xl min-h-[45vh]">
        <div className="w-8 h-8 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-light text-brand-500">Đang tải danh sách voucher...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-brand-100">
        <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest flex items-center gap-2">
          <Ticket size={16} />
          Mã Giảm Giá Khả Dụng ({vouchers.length})
        </h2>
      </div>

      {vouchers.length === 0 ? (
        <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="text-brand-400" size={28} />
          </div>
          <h2 className="text-lg font-light text-brand-900 tracking-wide mb-2">Chưa có voucher nào</h2>
          <p className="text-xs text-brand-500 font-light mb-2 leading-relaxed max-w-sm mx-auto">
            Hiện tại không có mã giảm giá nào đang diễn ra. Hãy quay lại sau!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((voucher: any) => {
            const expiryDate = new Date(voucher.endDate).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={voucher.id}
                className="bg-white border border-brand-200/40 hover:border-brand-350 transition-all rounded-2xl shadow-xs overflow-hidden flex"
              >
                {/* Left Ticket Side */}
                <div className="bg-brand-900 text-white w-28 flex flex-col items-center justify-center p-4 text-center border-r-2 border-dashed border-brand-200 relative">
                  {/* Decorative Ticket Punches */}
                  <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAF8F5] rounded-full border border-brand-200/40"></div>
                  <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-4 h-4 bg-[#FAF8F5] rounded-full border border-brand-200/40"></div>

                  <Award size={24} className="mb-1 text-amber-300" />
                  <span className="text-[10px] tracking-widest uppercase font-bold text-brand-200">GIẢM</span>
                  <span className="text-base font-extrabold mt-0.5 whitespace-nowrap">
                    {voucher.discountType === 'PERCENT' ? `${voucher.discountValue}%` : `${(voucher.discountValue / 1000).toFixed(0)}K`}
                  </span>
                </div>

                {/* Right Content Side */}
                <div className="flex-1 p-5 flex flex-col justify-between text-left space-y-3">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-brand-950 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-lg tracking-wider">
                        {voucher.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(voucher.code)}
                        className="text-brand-500 hover:text-brand-900 transition-colors p-1 cursor-pointer"
                        title="Copy Code"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-brand-800 font-light mt-2 leading-relaxed">
                      {voucher.description || `Mã giảm giá trị giá ${voucher.discountValue.toLocaleString()}đ cho mọi đơn hàng.`}
                    </p>
                  </div>

                  <div className="border-t border-brand-100/50 pt-2 flex flex-col gap-1 text-[10px] text-brand-500 font-light">
                    <div>
                      Đơn tối thiểu: <strong>{voucher.minOrderValue.toLocaleString('vi-VN')}₫</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Hết hạn: {expiryDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VouchersPage;
