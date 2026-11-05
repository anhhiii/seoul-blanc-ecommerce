import React, { useState } from 'react';
import { MapPin, Plus, ShieldAlert } from 'lucide-react';
import { useAddress } from '../../features/address/hooks/useAddress.js';
import type { Address } from '../../features/address/types/index.js';
import { AddressCard, AddressModal } from '../../features/address/components/index.js';

export const AddressesPage: React.FC = () => {
  const {
    useGetAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress();

  const { data: addressesRes, isLoading, isError } = useGetAddresses();
  const addresses = addressesRes?.data?.addresses || [];

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleFormSubmit = (payload: {
    fullName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    detail: string;
    latitude: number | null;
    longitude: number | null;
    isDefault: boolean;
  }) => {
    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress.id, data: payload },
        {
          onSuccess: () => {
            setModalOpen(false);
            setEditingAddress(null);
          },
        }
      );
    } else {
      createAddress.mutate(payload, {
        onSuccess: () => {
          setModalOpen(false);
          setEditingAddress(null);
        },
      });
    }
  };

  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 sm:p-8 shadow-xs relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-6 mb-6">
        <div>
          <h2 className="text-lg font-light text-brand-900 tracking-wide">Sổ địa chỉ nhận hàng</h2>
          <p className="text-xs text-brand-500 font-light mt-1">
            Lưu trữ địa chỉ nhận hàng của bạn để thanh toán thuận tiện nhất
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Thêm địa chỉ</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="text-red-500" size={28} />
          <p className="text-xs text-brand-500">Đã xảy ra lỗi khi tải danh sách địa chỉ. Vui lòng thử lại sau.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <div className="py-14 text-center max-w-sm mx-auto">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-brand-400" size={24} />
          </div>
          <h3 className="text-sm font-medium text-brand-800">Chưa có địa chỉ nào</h3>
          <p className="text-xs text-brand-500 font-light mt-1 mb-6">
            Bạn chưa tạo địa chỉ nhận hàng nào. Hãy thêm địa chỉ giao hàng đầu tiên để bắt đầu đặt hàng.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-3 border border-brand-900 text-brand-900 hover:bg-brand-50 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>Thêm địa chỉ mới</span>
          </button>
        </div>
      )}

      {/* Address Grid List */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address: Address) => (
            <AddressCard
              key={address.id}
              address={address}
              onSetDefault={(id) => setDefaultAddress.mutate(id)}
              onEdit={handleOpenEdit}
              onDelete={(id) => deleteAddress.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Address Modal (Add / Edit) */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleFormSubmit}
        editingAddress={editingAddress}
        isSubmitting={createAddress.isPending || updateAddress.isPending}
      />
    </div>
  );
};

export default AddressesPage;
