import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Search,
  FolderTree,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { useCategory } from '../../features/category/hooks/useCategory.js';
import type { Category, CategoryType } from '../../features/category/types/index.js';

export const CategoryManagementPage: React.FC = () => {
  const {
    useAdminGetCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadImage,
  } = useCategory();

  const { data: response, isLoading, isError } = useAdminGetCategories();
  const categories = response?.data?.categories || [];

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<CategoryType>('TOPS');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setType('TOPS');
    setDescription('');
    setImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setType(category.type);
    setDescription(category.description || '');
    setImage(category.image || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImage.mutate(file, {
      onSuccess: (res) => {
        setImage(res.data.url);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      type,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, data: payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        }
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
      },
    });
  };

  // Filtered categories based on search term
  const filteredCategories = categories.filter((cat) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(searchLower) ||
      cat.slug.toLowerCase().includes(searchLower) ||
      cat.type.toLowerCase().includes(searchLower) ||
      (cat.description && cat.description.toLowerCase().includes(searchLower))
    );
  });

  // Type color badge helper
  const getTypeBadgeStyles = (catType: CategoryType) => {
    switch (catType) {
      case 'TOPS':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'BOTTOMS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'OUTERWEAR':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'DRESSES':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900 tracking-tight flex items-center gap-2">
            <FolderTree className="text-brand-500" size={24} />
            Quản lý danh mục
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Thiết lập danh mục sản phẩm của hệ thống để phân loại quần áo chính xác.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
            />
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Hiển thị {filteredCategories.length} trên tổng số {categories.length} danh mục
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <p className="text-xs text-gray-400">Đang tải danh sách danh mục...</p>
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

        {/* Empty State */}
        {!isLoading && !isError && filteredCategories.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderTree size={28} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">
              {searchTerm ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {searchTerm
                ? 'Hãy thử nhập một từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
                : 'Bắt đầu phân loại sản phẩm bằng cách tạo danh mục đầu tiên của bạn.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openAddModal}
                className="mt-4 text-xs font-medium text-brand-500 hover:text-brand-600 underline cursor-pointer"
              >
                Tạo danh mục mới ngay
              </button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !isError && filteredCategories.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/55 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Danh mục</th>
                  <th className="py-4 px-6">Đường dẫn (Slug)</th>
                  <th className="py-4 px-6">Loại sản phẩm</th>
                  <th className="py-4 px-6 max-w-xs">Mô tả</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <FolderTree className="text-gray-400" size={16} />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-brand-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <code className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-100">
                        {cat.slug}
                      </code>
                    </td>
                    <td className="py-4.5 px-6">
                      <span
                        className={`text-[9px] font-semibold tracking-wider px-2 py-1 rounded-md border uppercase ${getTypeBadgeStyles(
                          cat.type
                        )}`}
                      >
                        {cat.type}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 max-w-xs">
                      <p className="text-xs text-gray-500 truncate" title={cat.description || ''}>
                        {cat.description || <span className="text-gray-300 italic">Không có mô tả</span>}
                      </p>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(cat.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Add / Edit Category Modal ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            onClick={() => !createCategory.isPending && !updateCategory.isPending && !uploadImage.isPending && setIsModalOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md p-6 relative z-10 mx-4 transform scale-100 transition-all duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={createCategory.isPending || updateCategory.isPending || uploadImage.isPending}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-semibold text-brand-900 pr-10">
              {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              {editingCategory
                ? 'Cập nhật lại thông tin của danh mục sản phẩm thời trang.'
                : 'Tạo mới một danh mục phân loại quần áo.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Image Upload Area */}
              <div>
                <label className="block text-[11px] font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Ảnh đại diện danh mục
                </label>

                {uploadImage.isPending ? (
                  <div className="flex flex-col items-center justify-center h-28 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Loader2 className="animate-spin text-brand-500" size={20} />
                    <span className="text-[10px] text-gray-400 mt-1">Đang tải ảnh lên Cloudinary...</span>
                  </div>
                ) : image ? (
                  <div className="relative w-full h-28 border border-gray-200 rounded-xl overflow-hidden group bg-gray-50">
                    <img src={image} alt="Category preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow cursor-pointer hover:scale-105 duration-200"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="category-image-upload"
                    className="flex flex-col items-center justify-center h-28 border border-dashed border-gray-200 rounded-xl hover:border-brand-400 transition-all bg-gray-50/50 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="text-gray-400" size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">Tải ảnh lên</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">Hỗ trợ JPG, PNG, WEBP</span>
                    <input
                      type="file"
                      id="category-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-[11px] font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo Sơ Mi, Quần Tây..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  disabled={createCategory.isPending || updateCategory.isPending || uploadImage.isPending}
                />
              </div>

              {/* Slug Field */}
              <div>
                <label className="block text-[11px] font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: ao-so-mi (Để trống tự sinh)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-gray-500"
                  disabled={createCategory.isPending || updateCategory.isPending || uploadImage.isPending}
                />
              </div>

              {/* Type Field */}
              <div>
                <label className="block text-[11px] font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Loại sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                  disabled={createCategory.isPending || updateCategory.isPending || uploadImage.isPending}
                >
                  <option value="TOPS">TOPS (Áo)</option>
                  <option value="BOTTOMS">BOTTOMS (Quần/Váy ngắn)</option>
                  <option value="OUTERWEAR">OUTERWEAR (Áo khoác)</option>
                  <option value="DRESSES">DRESSES (Đầm/Váy liền)</option>
                </select>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-[11px] font-semibold text-brand-800 uppercase tracking-wider mb-1.5">
                  Mô tả danh mục
                </label>
                <textarea
                  placeholder="Nhập mô tả ngắn về danh mục này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                  disabled={createCategory.isPending || updateCategory.isPending || uploadImage.isPending}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={createCategory.isPending || updateCategory.isPending || uploadImage.isPending}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    !name.trim() || createCategory.isPending || updateCategory.isPending || uploadImage.isPending
                  }
                  className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  {(createCategory.isPending || updateCategory.isPending) && (
                    <Loader2 className="animate-spin" size={12} />
                  )}
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => !deleteCategory.isPending && setDeletingId(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
          />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm p-6 relative z-10 mx-4 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800">Xác nhận xóa danh mục?</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác. Các danh mục đang có sản phẩm liên kết sẽ bị hệ thống từ chối xóa để đảm bảo toàn vẹn dữ liệu.
            </p>

            <div className="flex gap-2.5 justify-center mt-6">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                disabled={deleteCategory.isPending}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                disabled={deleteCategory.isPending}
              >
                {deleteCategory.isPending && <Loader2 className="animate-spin" size={12} />}
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagementPage;
