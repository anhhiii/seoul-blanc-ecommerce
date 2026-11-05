import React from 'react';
import { Search, Filter, Layers, Plus } from 'lucide-react';
import type { Category } from '../../../category/types/index.js';

export interface AdminProductFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  categories: Category[];
  onOpenAddModal: () => void;
}

export const AdminProductFilterBar: React.FC<AdminProductFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  onOpenAddModal,
}) => {
  return (
    <>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900 tracking-tight flex items-center gap-2">
            Quản lý sản phẩm
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý kho hàng, thông tin sản phẩm và phân loại kích cỡ, màu sắc tại đây.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, mã sản phẩm hoặc tag..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter size={12} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent outline-none border-none pr-2 font-medium text-gray-700 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
            <Layers size={12} className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent outline-none border-none pr-2 font-medium text-gray-700 cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang bán (Active)</option>
              <option value="OUT_OF_STOCK">Hết hàng (Out of Stock)</option>
              <option value="INACTIVE">Tạm ẩn (Inactive)</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

