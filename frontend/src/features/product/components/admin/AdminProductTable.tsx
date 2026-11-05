import React from 'react';
import {
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Image as ImageIcon,
} from 'lucide-react';
import type {
  Product,
  ProductStatusType,
  ProductVariant,
} from '../../types/index.js';

export interface AdminProductTableProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  pagination?: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  onPageChange: (newPage: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const getStatusBadgeClass = (prodStatus: ProductStatusType) => {
  switch (prodStatus) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'INACTIVE':
      return 'bg-gray-50 text-gray-500 border-gray-150';
    case 'OUT_OF_STOCK':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100';
  }
};

export const getStatusText = (prodStatus: ProductStatusType) => {
  switch (prodStatus) {
    case 'ACTIVE':
      return 'Đang bán';
    case 'INACTIVE':
      return 'Tạm ẩn';
    case 'OUT_OF_STOCK':
      return 'Hết hàng';
    default:
      return prodStatus;
  }
};

export const AdminProductTable: React.FC<AdminProductTableProps> = ({
  products,
  isLoading,
  isError,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-brand-500" size={32} />
          <p className="text-xs text-gray-400">Đang tải danh sách sản phẩm...</p>
        </div>
      )}

      {isError && (
        <div className="py-20 text-center space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Không thể tải dữ liệu</h3>
            <p className="text-xs text-gray-400 mt-1">Vui lòng kiểm tra lại kết nối API backend.</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Không tìm thấy sản phẩm nào</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Thử thay đổi bộ lọc tìm kiếm hoặc thêm sản phẩm thời trang mới.
          </p>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Sản phẩm</th>
                  <th className="py-4 px-6">Danh mục</th>
                  <th className="py-4 px-6">Giá niêm yết</th>
                  <th className="py-4 px-6">Kho hàng</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod: Product) => {
                  const totalStock = prod.variants.reduce((acc: number, v: ProductVariant) => acc + v.stock, 0);

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/30 transition-colors">
                      {/* Title & Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                            {prod.thumbnail ? (
                              <img
                                src={prod.thumbnail}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="text-gray-300" size={18} />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-brand-900 line-clamp-2 max-w-xs">
                              {prod.name}
                            </h4>
                            <code className="text-[10px] text-gray-400 font-mono block">
                              {prod.slug}
                            </code>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        {prod.categoryName ? (
                          <span className="text-[10px] font-semibold text-brand-800 bg-brand-50/80 px-2.5 py-1 rounded-md border border-brand-100/50">
                            {prod.categoryName}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Mất liên kết</span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-brand-900">
                            {prod.price.toLocaleString('vi-VN')}₫
                          </span>
                          {prod.discountPrice && (
                            <span className="text-[10px] text-red-500 line-through">
                              {prod.discountPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock and variants preview */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                            Tổng: <strong className="font-semibold text-brand-900">{totalStock}</strong>
                            {prod.variants.some((v: ProductVariant) => v.stock < 5) && (
                              <span
                                className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"
                                title="Có biến thể sắp hết hàng (< 5)!"
                              />
                            )}
                          </span>
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {prod.variants.slice(0, 3).map((v: ProductVariant, i: number) => (
                              <span
                                key={i}
                                className={`text-[9px] px-1 rounded border ${
                                  v.stock < 5
                                    ? 'bg-red-50 text-red-600 border-red-200 font-semibold'
                                    : 'bg-gray-100 text-gray-600 border-gray-150'
                                }`}
                                title={`Màu ${v.color} - Size ${v.size} - Kho: ${v.stock}`}
                              >
                                {v.color.slice(0, 3)}-{v.size}({v.stock})
                              </span>
                            ))}
                            {prod.variants.length > 3 && (
                              <span className="text-[9px] text-gray-400">+{prod.variants.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`text-[9px] font-semibold px-2.5 py-1 rounded-md border tracking-wider uppercase ${getStatusBadgeClass(
                            prod.status
                          )}`}
                        >
                          {getStatusText(prod.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(prod)}
                            className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${prod.name}?`)) {
                                onDelete(prod.id);
                              }
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-[11px] text-gray-500 font-medium">
                Trang {pagination.page} / {pagination.totalPages} (Tổng {pagination.total} sản phẩm)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
