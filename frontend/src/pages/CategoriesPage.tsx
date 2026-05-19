import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCategory } from '../features/category/hooks/useCategory.js';
import type { Category } from '../features/category/types/index.js';

const parentTypes = [
  { type: 'TOPS', label: 'ÁO', emoji: '👔', desc: 'Các kiểu áo thun, áo sơ mi, áo polo và croptop' },
  { type: 'BOTTOMS', label: 'QUẦN', emoji: '👖', desc: 'Quần jeans, quần vải, quần shorts phong cách' },
  { type: 'OUTERWEAR', label: 'ÁO KHOÁC', emoji: '🧥', desc: 'Blazer, cardigan, bomber và áo khoác thời thượng' },
  { type: 'DRESSES', label: 'ĐẦM & VÁY', emoji: '👗', desc: 'Váy dài, chân váy ngắn và đầm dự tiệc tinh tế' },
];

export const CategoriesPage: React.FC = () => {
  const { useGetCategories } = useCategory();
  const { data: response, isLoading } = useGetCategories();
  const categories = response?.data?.categories || [];

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Page Header */}
        <div className="border-b border-brand-200/50 pb-6 mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-brand-500 font-medium mb-2">
              <Link to="/" className="hover:text-brand-900 transition-colors">Trang chủ</Link> / 
              <span className="text-brand-900 ml-1">Danh mục</span>
            </div>
            <h1 className="text-3xl font-light text-brand-900 tracking-wider">
              PHÂN LOẠI <span className="font-semibold">BỘ SƯU TẬP</span>
            </h1>
            <p className="text-xs text-brand-500 mt-2 font-light max-w-md">
              Hệ thống danh mục thiết kế thời trang của Seoul Blanc được chia thành 4 nhóm sản phẩm chính.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs bg-brand-900 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-850 self-start sm:self-auto"
          >
            Xem tất cả sản phẩm
            <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading && (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-brand-400 font-light">Đang tải cấu trúc danh mục...</p>
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="h-[40vh] flex flex-col items-center justify-center border border-brand-200/30 rounded-2xl bg-white p-8 text-center">
            <Sparkles className="text-brand-400 mb-3" size={36} />
            <h3 className="text-sm font-semibold text-brand-900">Chưa có danh mục nào</h3>
            <p className="text-xs text-brand-500 font-light mt-1">Vui lòng khởi tạo các danh mục từ trang quản trị Admin.</p>
          </div>
        )}

        {!isLoading && categories.length > 0 && (
          <div className="space-y-12">
            {parentTypes.map((pt) => {
              const children = categories.filter((c: Category) => c.type === pt.type);

              return (
                <div key={pt.type} className="space-y-6">
                  {/* Parent Title Section */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-brand-100 pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl sm:text-2xl" role="img" aria-label={pt.label}>{pt.emoji}</span>
                      <h2 className="text-lg sm:text-xl font-semibold tracking-wide text-brand-900 uppercase">
                        {pt.label}
                      </h2>
                      <span className="text-xs text-brand-400 font-light">
                        ({children.length} danh mục con)
                      </span>
                    </div>
                    <p className="text-xs text-brand-400 font-light italic max-w-md hidden sm:block">
                      {pt.desc}
                    </p>
                    <Link
                      to={`/products?type=${pt.type}`}
                      className="text-xs text-brand-600 hover:text-brand-900 font-semibold flex items-center gap-1 group/link"
                    >
                      Xem tất cả {pt.label}
                      <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Subcategories Grid */}
                  {children.length === 0 ? (
                    <div className="bg-brand-50/30 border border-brand-100 rounded-2xl p-6 text-center text-xs text-brand-400 font-light italic">
                      Chưa có danh mục con thuộc nhóm {pt.label.toLowerCase()}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {children.map((cat: Category) => (
                        <Link
                          key={cat.id}
                          to={`/products?type=${pt.type}&category=${cat.id}`}
                          className="group bg-white border border-brand-200/40 rounded-2xl p-6 hover:border-brand-500 hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer"
                        >
                          {cat.image ? (
                            <div className="w-14 h-14 rounded-full overflow-hidden border border-brand-100 bg-brand-50 flex-shrink-0">
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-full border border-brand-200 bg-brand-50/50 flex items-center justify-center text-2xl flex-shrink-0">
                              {pt.emoji}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-900 group-hover:text-brand-700 transition-colors truncate">
                              {cat.name}
                            </h3>
                            <p className="text-[11px] text-brand-500 font-light truncate mt-0.5">
                              {cat.description || 'Sản phẩm thời trang cao cấp'}
                            </p>
                          </div>
                          
                          <ArrowRight size={14} className="text-brand-300 group-hover:text-brand-900 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoriesPage;
