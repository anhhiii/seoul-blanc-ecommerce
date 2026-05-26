import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, ArrowRight, X, Heart, Star } from 'lucide-react';
import { useProduct } from '../features/product/hooks/useProduct.js';
import { useCategory } from '../features/category/hooks/useCategory.js';
import { useAuthStore } from '../store/authStore.js';
import { useWishlist } from '../features/wishlist/hooks/useWishlist.js';
import { toast } from 'sonner';
import type { Product } from '../features/product/types/index.js';

const parentCategories = [
  { label: 'TẤT CẢ', name: 'Tất cả', type: '' },
  { label: 'ÁO', name: 'Áo', type: 'TOPS' },
  { label: 'QUẦN', name: 'Quần', type: 'BOTTOMS' },
  { label: 'ÁO KHOÁC', name: 'Áo khoác', type: 'OUTERWEAR' },
  { label: 'VÁY/ĐẦM', name: 'Váy / Đầm', type: 'DRESSES' },
];

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { useGetWishlistIds, toggleWishlist } = useWishlist();
  const { data: wishlistIdsRes } = useGetWishlistIds();
  const wishlistIds = wishlistIdsRes?.data?.productIds || [];
  const isFavorited = (id: string) => wishlistIds.includes(id);

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
      navigate('/login');
      return;
    }
    toggleWishlist.mutate(productId);
  };

  const { useGetProductsInfinite } = useProduct();
  const { useGetCategories } = useCategory();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, page, category from search params
  const categoryIdParam = searchParams.get('category') || '';
  const typeParam = searchParams.get('type') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const colorsParam = searchParams.get('colors') || '';
  const sizesParam = searchParams.get('sizes') || '';

  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  // Queries
  const { data: categoriesResponse } = useGetCategories();
  const categories = categoriesResponse?.data?.categories || [];

  // Determine active parent category type (Derived State from URL and categories)
  const selectedCat = categoryIdParam && categories.length > 0
    ? categories.find((c) => c.id === categoryIdParam)
    : null;
  const isSpecialType = ['NEW', 'BESTSELLER', 'SALE'].includes(typeParam);
  const activeType = selectedCat ? selectedCat.type : (isSpecialType ? '' : typeParam);

  // Query products with active filters via Infinite Scroll
  const {
    data: productsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProductsInfinite({
    search: searchParam || undefined,
    categoryId: categoryIdParam || undefined,
    categoryType: !categoryIdParam && activeType ? activeType : undefined,
    type: isSpecialType ? typeParam : undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    colors: colorsParam || undefined,
    sizes: sizesParam || undefined,
    limit: 12,
  });

  // Flatten products from pages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = productsData ? productsData.pages.flatMap((page: any) => page.data?.products || []) : [];

  // Get pagination from the last page
  const lastPagePagination = productsData?.pages[productsData.pages.length - 1]?.data?.pagination;
  const totalCount = lastPagePagination?.total || 0;

  // Setup Intersection Observer for scroll-to-bottom triggering
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle Parent Type selection (Row 1 tabs)
  const handleTypeSelect = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    // Switch type will clear specific category filter
    params.delete('category');
    params.set('page', '1');
    setSearchParams(params);
  };

  // Handle Sub-category select (Row 2 pills)
  const handleCategorySelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('category', id);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  };





  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    params.set('page', '1');
    setSearchParams(params);
  };

  const toggleFilter = (type: 'colors' | 'sizes', value: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get(type) ? params.get(type)!.split(',') : [];
    if (current.includes(value)) {
      const updated = current.filter(item => item !== value);
      if (updated.length > 0) params.set(type, updated.join(','));
      else params.delete(type);
    } else {
      current.push(value);
      params.set(type, current.join(','));
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const activeColors = colorsParam ? colorsParam.split(',') : [];
  const activeSizes = sizesParam ? sizesParam.split(',') : [];

  const COLORS_LIST = ['BLACK', 'WHITE', 'GRAY', 'BEIGE', 'BROWN', 'NAVY', 'GREEN', 'RED', 'BLUE', 'YELLOW', 'PURPLE', 'PINK', 'ORANGE'];
  const SIZES_LIST = ['S', 'M', 'L', 'XL'];

  // Get dynamic Row 2 subcategories
  const subCategories = activeType
    ? categories.filter((c) => c.type === activeType)
    : categories; // show all categories if "Tất cả" is selected

  const activeCategory = categories.find((c) => c.id === categoryIdParam);
  const activeParentObj = parentCategories.find((p) => p.type === activeType);

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* ================= BREADCRUMBS (As in Image) ================= */}
        <div className="text-[11px] tracking-wide text-brand-500 font-light mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-900 transition-colors">Trang chủ</Link>
          <span>&gt;</span>
          <Link to="/products" className="hover:text-brand-900 transition-colors">Sản phẩm</Link>
          {activeParentObj && activeParentObj.type && (
            <>
              <span>&gt;</span>
              <button
                onClick={() => handleTypeSelect(activeParentObj.type)}
                className="hover:text-brand-900 transition-colors font-medium cursor-pointer"
              >
                {activeParentObj.name}
              </button>
            </>
          )}
          {activeCategory && (
            <>
              <span>&gt;</span>
              <span className="text-brand-900 font-semibold">{activeCategory.name}</span>
            </>
          )}
          {isSpecialType && (
            <>
              <span>&gt;</span>
              <span className="text-brand-900 font-semibold">
                {typeParam === 'NEW' && 'Sản phẩm mới'}
                {typeParam === 'BESTSELLER' && 'Bán chạy nhất'}
                {typeParam === 'SALE' && 'Outlet - Sale'}
              </span>
            </>
          )}
        </div>

        {/* ================= PAGE TITLE / BANNER ================= */}
        {isSpecialType && (
          <div className="mb-8 bg-brand-900 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-sm animate-in fade-in duration-300">
            {/* Minimalist Grid Pattern Decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-950/20 to-transparent opacity-60"></div>
            
            <div className="relative z-10 max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-brand-300 font-bold mb-2 block">
                BỘ SƯU TẬP ĐẶC BIỆT
              </span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-wider uppercase mb-2">
                {typeParam === 'NEW' && <>Sản phẩm <span className="font-semibold">mới về</span></>}
                {typeParam === 'BESTSELLER' && <>Sản phẩm <span className="font-semibold">bán chạy nhất</span></>}
                {typeParam === 'SALE' && <>Chương trình <span className="font-semibold">Outlet - Sale</span></>}
              </h2>
              <p className="text-[11px] text-brand-200/80 font-light leading-relaxed max-w-sm">
                {typeParam === 'NEW' && 'Cập nhật những xu hướng thời trang tối giản Hàn Quốc mới nhất từ Seoul Blanc.'}
                {typeParam === 'BESTSELLER' && 'Khám phá các sản phẩm được yêu thích và chọn mua nhiều nhất bởi khách hàng của chúng tôi.'}
                {typeParam === 'SALE' && 'Cơ hội sở hữu các thiết kế cao cấp với mức giá ưu đãi đặc biệt lên đến 50%.'}
              </p>
            </div>
          </div>
        )}

        {/* Search Parameter Indicator */}
        {searchParam && (
          <div className="mb-6 bg-white border border-brand-200/50 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
            <span className="text-xs text-brand-700">
              Kết quả tìm kiếm cho từ khóa: <strong className="font-semibold text-brand-900">"{searchParam}"</strong>
            </span>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params);
              }}
              className="text-xs text-brand-400 hover:text-red-500 flex items-center gap-1 cursor-pointer font-medium transition-colors"
            >
              <X size={12} /> Xóa tìm kiếm
            </button>
          </div>
        )}

        {/* Special Type Filter Indicator */}
        {isSpecialType && (
          <div className="mb-6 bg-white border border-brand-200/50 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
            <span className="text-xs text-brand-700">
              Đang xem bộ sưu tập: <strong className="font-semibold text-brand-900">
                {typeParam === 'NEW' && 'Sản phẩm mới'}
                {typeParam === 'BESTSELLER' && 'Bán chạy nhất'}
                {typeParam === 'SALE' && 'Outlet - Sale'}
              </strong>
            </span>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('type');
                setSearchParams(params);
              }}
              className="text-xs text-brand-400 hover:text-red-500 flex items-center gap-1 cursor-pointer font-medium transition-colors"
            >
              <X size={12} /> Xóa bộ lọc bộ sưu tập
            </button>
          </div>
        )}

        {/* ================= CATEGORY TABS & PILLS (As in Image) ================= */}
        <div className="bg-white border border-brand-200/50 rounded-2xl p-6 mb-8 space-y-5">

          {/* Row 1: Parent Category Tabs */}
          <div className="border-b border-brand-100 pb-3 flex flex-wrap items-center gap-6 sm:gap-10">
            {parentCategories.map((p) => {
              const isActive = activeType === p.type;
              return (
                <button
                  key={p.label}
                  onClick={() => handleTypeSelect(p.type)}
                  className={`text-xs sm:text-sm uppercase tracking-widest font-bold pb-2 relative transition-all cursor-pointer ${isActive
                      ? 'text-brand-900 after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-900 scale-102'
                      : 'text-brand-400 hover:text-brand-600'
                    }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Row 2: Sub-category Pills */}
          <div className="flex flex-wrap items-center gap-2 select-none">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${!categoryIdParam
                  ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                  : 'border-brand-200 text-brand-600 bg-brand-50/20 hover:border-brand-400'
                }`}
            >
              Tất cả
            </button>

            {subCategories.map((cat) => {
              const isSelected = categoryIdParam === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${isSelected
                      ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                      : 'border-brand-200 text-brand-600 bg-white hover:border-brand-400'
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= SEARCH & SORTING BAR ================= */}
        <div className="flex items-center justify-between gap-4 mb-8 text-xs">
          {(categoryIdParam || searchParam || activeType || isSpecialType) ? (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-brand-500 hover:text-brand-900 font-semibold transition-colors cursor-pointer border border-brand-200 bg-white px-3 py-1.5 rounded-lg"
            >
              <X size={14} />
              Xóa bộ lọc
            </button>
          ) : (
            <div />
          )}
          <div className="text-brand-500 font-light">
            Hiển thị {products.length} trên {totalCount} sản phẩm
          </div>
        </div>

        {/* ================= PRODUCTS GRID & SIDEBAR ================= */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ================= SIDEBAR FILTERS ================= */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Price Filter */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200/50 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-900 mb-4">Khoảng giá</h3>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  placeholder="TỪ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs p-2 border border-brand-200 rounded-lg text-center focus:border-brand-500 outline-none"
                />
                <span className="text-brand-400">-</span>
                <input
                  type="number"
                  placeholder="ĐẾN"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs p-2 border border-brand-200 rounded-lg text-center focus:border-brand-500 outline-none"
                />
              </div>
              <button
                onClick={handlePriceFilter}
                className="w-full bg-brand-900 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
              >
                Áp dụng
              </button>
            </div>

            {/* Color Filter */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200/50 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-900 mb-4">Màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {COLORS_LIST.map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleFilter('colors', color)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${activeColors.includes(color)
                        ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                        : 'border-brand-200 bg-brand-50 hover:border-brand-400 text-brand-700'
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="bg-white p-5 rounded-2xl border border-brand-200/50 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-900 mb-4">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {SIZES_LIST.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleFilter('sizes', size)}
                    className={`w-10 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center ${activeSizes.includes(size)
                        ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                        : 'border-brand-200 bg-brand-50 hover:border-brand-400 text-brand-700'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= MAIN PRODUCTS GRID ================= */}
          <main className="flex-1">

            {isLoading && (
              <div className="h-[40vh] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-brand-400 font-light">Đang tải sản phẩm...</p>
              </div>
            )}

            {isError && (
              <div className="h-[40vh] flex flex-col items-center justify-center gap-2 border border-brand-200/30 rounded-2xl bg-white p-8 text-center">
                <AlertTriangle className="text-red-500" size={32} />
                <h3 className="text-sm font-semibold text-brand-900 mt-2">Đã xảy ra lỗi</h3>
                <p className="text-xs text-brand-500 font-light max-w-xs">Không thể kết nối đến máy chủ. Vui lòng tải lại trang.</p>
              </div>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <div className="h-[40vh] flex flex-col items-center justify-center border border-brand-200/30 rounded-2xl bg-white p-8 text-center">
                <Sparkles className="text-brand-400 mb-3" size={36} />
                <h3 className="text-sm font-semibold text-brand-900">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-brand-500 font-light mt-1 max-w-xs">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bớt các bộ lọc hiện tại.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-brand-900 text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg hover:bg-brand-850"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {!isLoading && !isError && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((prod: Product) => (
                    <div
                      key={prod.id}
                      className="group flex flex-col bg-white border border-brand-200/40 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 relative"
                    >
                      {/* Thumbnail Image */}
                      <Link to={`/products/${prod.slug}`} className="aspect-[3/4] relative overflow-hidden bg-brand-50 block">
                        <img
                          src={prod.thumbnail}
                          alt={prod.name}
                          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                        />
                        {prod.discountPrice && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                            SALE
                          </span>
                        )}
                      </Link>

                      {/* Toggle Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleWishlist(prod.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-brand-200/45 flex items-center justify-center shadow-xs z-10 transition-all duration-200 cursor-pointer hover:bg-white"
                        title={isFavorited(prod.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <Heart
                          size={14}
                          className={`transition-colors duration-200 ${
                            isFavorited(prod.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-brand-600 hover:text-red-500'
                          }`}
                        />
                      </button>

                      {/* Info & Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-brand-400 font-medium">
                            {prod.categoryName || 'Seoul Blanc'}
                          </span>
                          <Link to={`/products/${prod.slug}`}>
                            <h4 className="text-xs sm:text-sm text-brand-900 font-light mt-1 mb-2 hover:text-brand-600 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                              {prod.name}
                            </h4>
                          </Link>
                        </div>

                        {/* Star Rating */}
                        {prod.ratingAverage > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={10}
                                className={`${
                                  star <= Math.round(prod.ratingAverage)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-brand-100 text-brand-200'
                                }`}
                              />
                            ))}
                            <span className="text-[9px] text-brand-400 ml-1">
                              ({prod.totalReviews})
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-baseline gap-2 mb-3.5">
                            <span className="text-sm font-semibold text-brand-900">
                              {(prod.discountPrice || prod.price).toLocaleString('vi-VN')}₫
                            </span>
                            {prod.discountPrice && (
                              <span className="text-[11px] text-brand-400 line-through">
                                {prod.price.toLocaleString('vi-VN')}₫
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/products/${prod.slug}`}
                            className="w-full py-2 bg-brand-900 hover:bg-brand-800 text-white text-[10px] uppercase tracking-widest font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 group/btn"
                          >
                            Xem chi tiết
                            <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Indicator & Trigger */}
                <div ref={observerTarget} className="mt-12 py-6 flex flex-col items-center justify-center gap-2">
                  {isFetchingNextPage ? (
                    <>
                      <div className="w-8 h-8 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-brand-500 font-light">Đang tải thêm sản phẩm...</p>
                    </>
                  ) : hasNextPage ? (
                    <p className="text-xs text-brand-400 font-light">Cuộn xuống hoặc kéo để xem tiếp...</p>
                  ) : products.length > 0 ? (
                    <p className="text-xs text-brand-400 font-light bg-brand-50/50 px-4 py-2 rounded-full border border-brand-100/50">
                      Đã hiển thị tất cả {totalCount} sản phẩm của Seoul Blanc.
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
