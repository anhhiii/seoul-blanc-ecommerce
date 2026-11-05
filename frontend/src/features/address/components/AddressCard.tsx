import React from 'react';
import { Check, Edit2, Trash2, MapPin } from 'lucide-react';
import type { Address } from '../types/index.js';

export interface AddressCardProps {
  address: Address;
  onSetDefault: (id: string) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  isSettingDefault?: boolean;
  isDeleting?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onSetDefault,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
        address.isDefault
          ? 'border-brand-900 bg-brand-50/10 shadow-xs'
          : 'border-brand-200/50 bg-white hover:border-brand-350 hover:shadow-xs'
      }`}
    >
      {/* Card Badge default */}
      {address.isDefault && (
        <span className="absolute top-4 right-4 bg-brand-900 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
          <Check size={10} /> Mặc định
        </span>
      )}

      <div className="space-y-2 pr-12">
        <p className="text-sm font-semibold text-brand-900 flex items-center gap-1.5">
          {address.fullName}
        </p>
        <p className="text-xs text-brand-500 font-light">
          Số điện thoại: <span className="font-medium text-brand-800">{address.phoneNumber}</span>
        </p>
        <p className="text-xs text-brand-700 leading-relaxed font-light">
          {address.detail}, {address.ward}, {address.province}
        </p>

        {address.latitude && address.longitude && (
          <p className="text-[10px] text-brand-400 flex items-center gap-1 font-light italic">
            <MapPin size={10} className="text-red-500" />
            Định vị: {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 border-t border-brand-100/50 pt-4 flex items-center justify-between gap-4">
        <div>
          {!address.isDefault && (
            <button
              onClick={() => onSetDefault(address.id)}
              className="text-xs text-brand-600 hover:text-brand-900 transition-colors font-medium cursor-pointer"
            >
              Thiết lập mặc định
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(address)}
            className="p-1.5 text-brand-400 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-all cursor-pointer"
            title="Chỉnh sửa địa chỉ"
          >
            <Edit2 size={13.5} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) {
                onDelete(address.id);
              }
            }}
            className="p-1.5 text-brand-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
            title="Xóa địa chỉ"
          >
            <Trash2 size={13.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

