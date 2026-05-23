import React from 'react';
import { MapPin, Plus } from 'lucide-react';

export const AddressesPage: React.FC = () => {
  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-8 text-center shadow-xs">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin className="text-brand-400" size={28} />
      </div>
      <h2 className="text-lg font-light text-brand-900 tracking-wide mb-2">Sổ địa chỉ nhận hàng</h2>
      <p className="text-xs text-brand-500 font-light mb-8 leading-relaxed max-w-sm mx-auto">
        Lưu trữ và quản lý các địa chỉ nhận hàng của bạn để thanh toán nhanh hơn. Tính năng này sẽ sớm hoạt động.
      </p>
      <button
        disabled
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs"
      >
        <Plus size={12} />
        <span>Thêm địa chỉ mới</span>
      </button>
    </div>
  );
};

export default AddressesPage;
