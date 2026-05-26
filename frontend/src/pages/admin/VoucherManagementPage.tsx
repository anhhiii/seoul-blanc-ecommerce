import React, { useState } from 'react';
import { Ticket, Plus, Edit2, Trash2, Calendar, X } from 'lucide-react';
import { useVoucher } from '../../features/voucher/hooks/useVoucher.js';

export const VoucherManagementPage: React.FC = () => {
  const { useAdminGetVouchers, createVoucher, updateVoucher, deleteVoucher } = useVoucher();
  const { data: vouchers = [], isLoading } = useAdminGetVouchers();

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  // Form Fields State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState(10000);
  const [minOrderValue, setMinOrderValue] = useState(50000);
  const [usageLimit, setUsageLimit] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleOpenCreateModal = () => {
    setEditingVoucherId(null);
    setCode('');
    setDescription('');
    setDiscountType('FIXED');
    setDiscountValue(20000);
    setMinOrderValue(100000);
    setUsageLimit(50);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (v: any) => {
    setEditingVoucherId(v.id);
    setCode(v.code);
    setDescription(v.description || '');
    setDiscountType(v.discountType);
    setDiscountValue(v.discountValue);
    setMinOrderValue(v.minOrderValue);
    setUsageLimit(v.usageLimit);
    setStartDate(new Date(v.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(v.endDate).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      usageLimit: Number(usageLimit),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    if (!payload.code) {
      window.alert('Vui lòng nhập mã giảm giá!');
      return;
    }

    if (editingVoucherId) {
      updateVoucher.mutate(
        { id: editingVoucherId, data: payload },
        {
          onSuccess: () => setModalOpen(false),
        }
      );
    } else {
      createVoucher.mutate(payload, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const handleDeleteVoucher = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá ${code}?`)) {
      deleteVoucher.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-light text-brand-500">Đang tải danh sách voucher...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-brand-950 tracking-wider uppercase flex items-center gap-2">
            Quản lý Voucher
          </h1>
          <p className="text-xs text-brand-500 font-light mt-0.5">Tạo lập, sửa đổi và phân phối mã giảm giá cho Seoul Blanc</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-900 hover:bg-brand-850 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Plus size={13} />
          Tạo Voucher Mới
        </button>
      </div>

      <div className="bg-white border border-brand-200/50 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-100 text-[10px] uppercase tracking-widest text-brand-500 font-bold bg-brand-50/20">
                <th className="py-3.5 px-6">Mã giảm giá</th>
                <th className="py-3.5 px-6">Chi tiết giảm</th>
                <th className="py-3.5 px-6">Đơn tối thiểu</th>
                <th className="py-3.5 px-6 text-center">Lượt dùng tối đa</th>
                <th className="py-3.5 px-6 text-center">Hạn sử dụng</th>
                <th className="py-3.5 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 font-light text-brand-800">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-400">
                    Chưa có mã giảm giá nào được tạo.
                  </td>
                </tr>
              ) : (
                vouchers.map((v: any) => {
                  const formatDay = (dateStr: string) =>
                    new Date(dateStr).toLocaleDateString('vi-VN', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    });

                  return (
                    <tr key={v.id} className="hover:bg-brand-50/10">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-brand-950 bg-brand-50 border border-brand-200/80 px-2.5 py-1 rounded-lg tracking-wider">
                          {v.code}
                        </span>
                        {v.description && (
                          <span className="block text-[10px] text-brand-500 mt-1.5 max-w-[200px] truncate">
                            {v.description}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString('vi-VN')}₫`}
                      </td>
                      <td className="py-4 px-6">{v.minOrderValue.toLocaleString('vi-VN')}₫</td>
                      <td className="py-4 px-6 text-center">{v.usageLimit}</td>
                      <td className="py-4 px-6 text-center text-[10px] text-brand-600">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar size={11} />
                          <span>
                            {formatDay(v.startDate)} - {formatDay(v.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-1 text-brand-600 hover:text-brand-900 cursor-pointer border-none bg-transparent"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(v.id, v.code)}
                          disabled={deleteVoucher.isPending}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-40 border-none bg-transparent"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Create/Edit Voucher */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white border border-brand-200/50 rounded-3xl p-6 shadow-xl max-w-lg w-full space-y-4 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                {editingVoucherId ? 'Chỉnh sửa Voucher' : 'Tạo Voucher Mới'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-brand-400 hover:text-brand-900 border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Mã Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MÃ GIẢM GIÁ (VD: VIPSUMMER)"
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2 text-xs text-brand-900 placeholder:text-brand-400 focus:outline-none uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Loại giảm giá
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2.5 text-xs text-brand-900 focus:outline-none"
                  >
                    <option value="FIXED">Giá trị cố định (đ)</option>
                    <option value="PERCENT">Phần trăm (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Giá trị giảm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Đơn tối thiểu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Số lượng tối đa
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2.5 text-xs text-brand-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2.5 text-xs text-brand-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                  Mô tả Voucher
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả quyền lợi voucher (VD: Giảm 20K cho đơn hàng từ 100K)..."
                  rows={2}
                  className="w-full bg-brand-50/20 border border-brand-250 rounded-xl px-3 py-2.5 text-xs text-brand-900 placeholder:text-brand-400 focus:outline-none resize-none font-light"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createVoucher.isPending || updateVoucher.isPending}
                  className="flex-1 bg-brand-900 hover:bg-brand-950 text-white rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  {createVoucher.isPending || updateVoucher.isPending ? 'Đang lưu...' : 'Lưu Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherManagementPage;
