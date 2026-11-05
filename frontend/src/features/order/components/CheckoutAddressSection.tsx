import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PlusCircle, AlertCircle } from 'lucide-react';
import type { Address } from '../../address/types/index.js';

export interface CheckoutAddressSectionProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddAddressClick?: () => void;
}

export const CheckoutAddressSection: React.FC<CheckoutAddressSectionProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddressClick,
}) => {
  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-brand-100">
        <div className="flex items-center gap-2.5">
          <MapPin size={18} className="text-brand-900" />
          <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
            Địa chỉ nhận hàng
          </h2>
        </div>
        <Link
          to="/account/addresses"
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 hover:text-brand-900 transition-colors"
        >
          <PlusCircle size={12} />
          Thêm địa chỉ
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-brand-50/40 border border-dashed border-brand-200 rounded-2xl space-y-3">
          <AlertCircle className="mx-auto text-brand-400" size={24} />
          <p className="text-xs text-brand-600 font-light">
            Bạn chưa có địa chỉ nhận hàng nào lưu trong tài khoản.
          </p>
          <button
            onClick={onAddAddressClick}
            className="px-4 py-2 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-850 cursor-pointer"
          >
            Thêm địa chỉ giao hàng
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`block p-4 border rounded-2xl cursor-pointer transition-all ${
                selectedAddressId === addr.id
                  ? 'border-brand-900 bg-brand-50/20'
                  : 'border-brand-200/60 hover:border-brand-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => onSelectAddress(addr.id)}
                  className="mt-1 accent-brand-900"
                />
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-brand-900">{addr.fullName}</span>
                    <span className="text-brand-500 font-light">|</span>
                    <span className="text-brand-700">{addr.phoneNumber}</span>
                    {addr.isDefault && (
                      <span className="text-[9px] bg-brand-900/10 text-brand-900 px-1.5 py-0.5 rounded font-medium">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-brand-600 font-light leading-relaxed">
                    {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

