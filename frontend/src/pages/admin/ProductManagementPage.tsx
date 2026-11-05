import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useProduct } from '../../features/product/hooks/useProduct.js';
import { useCategory } from '../../features/category/hooks/useCategory.js';
import {
  AdminProductFilterBar,
  AdminProductTable,
  AdminProductModal,
} from '../../features/product/components/admin/index.js';
import type {
  Product,
  ProductStatusType,
  ProductVariant,
} from '../../features/product/types/index.js';

export const ProductManagementPage: React.FC = () => {
  const {
    useAdminGetProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProduct();

  const { useGetCategories } = useCategory();

  // Filters & Page States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);

  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useAdminGetProducts({
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    status: (selectedStatus as ProductStatusType) || undefined,
    page,
    limit,
  });

  const { data: categoriesResponse } = useGetCategories();
  const categories = categoriesResponse?.data?.categories || [];
  const products = productsResponse?.data?.products || [];
  const pagination = productsResponse?.data?.pagination;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (payload: {
    name: string;
    description: string;
    categoryId: string;
    thumbnail: string;
    images: string[];
    price: number;
    discountPrice?: number;
    material?: string;
    fit?: string;
    style?: string;
    tags: string[];
    status: ProductStatusType;
    variants: ProductVariant[];
  }) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingProduct(null);
          },
        }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingProduct(null);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filter and action toolbar */}
      <AdminProductFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(val) => {
          setSelectedCategory(val);
          setPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setPage(1);
        }}
        categories={categories}
        onOpenAddModal={openAddModal}
      />

      {/* Main product table */}
      <AdminProductTable
        products={products}
        isLoading={isProductsLoading}
        isError={isProductsError}
        pagination={pagination}
        onPageChange={setPage}
        onEdit={openEditModal}
        onDelete={(id) => setDeletingId(id)}
      />

      {/* Add / Edit Product Modal */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        categories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => !deleteProduct.isPending && setDeletingId(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
          />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm p-6 relative z-10 mx-4 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800">Xác nhận xóa sản phẩm?</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này sẽ tự động xóa các biến thể hàng liên kết. Các sản phẩm đã từng được đặt hàng sẽ bị từ chối xóa để bảo toàn dữ liệu.
            </p>

            <div className="flex gap-2.5 justify-center mt-6">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                disabled={deleteProduct.isPending}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                disabled={deleteProduct.isPending}
              >
                {deleteProduct.isPending && <Loader2 className="animate-spin" size={12} />}
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagementPage;
