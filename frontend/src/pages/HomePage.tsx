import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ImageIcon, ChevronLeft, ChevronRight, Eye, Flame, Heart, Ticket, Star } from 'lucide-react';
import { useProduct } from '../features/product/hooks/useProduct.js';
import { useCategory } from '../features/category/hooks/useCategory.js';
import { useAuthStore } from '../store/authStore.js';
import { useWishlist } from '../features/wishlist/hooks/useWishlist.js';
import { useVoucher } from '../features/voucher/hooks/useVoucher.js';
import { toast } from 'sonner';
import type { Category } from '../features/category/types/index.js';
import type { Product } from '../features/product/types/index.js';

const features = [
  { icon: <Truck size={22} strokeWidth={1} />, title: 'MIỄN PHÍ VẬN CHUYỂN', desc: 'Đơn hàng từ 500.000đ' },
  { icon: <Shield size={22} strokeWidth={1} />, title: 'CAM KẾT CHÍNH HÃNG', desc: '100% sản phẩm chất lượng' },
  { icon: <RefreshCw size={22} strokeWidth={1} />, title: 'ĐỔI TRẢ 30 NGÀY', desc: 'Hoàn tiền nếu không hài lòng' },
  { icon: <Headphones size={22} strokeWidth={1} />, title: 'HỖ TRỢ 24/7', desc: 'Tư vấn mọi lúc mọi nơi' },
];

// Emoji mapping fallback for types
const categoryMeta: Record<string, { emoji: string; desc: string }> = {
  TOPS: { emoji: '👔', desc: 'Áo thun, áo sơ mi, áo polo tối giản' },
  BOTTOMS: { emoji: '👖', desc: 'Quần jeans, quần vải, quần short thanh lịch' },
  OUTERWEAR: { emoji: '🧥', desc: 'Blazer, cardigan, áo khoác dạ phong cách' },
  DRESSES: { emoji: '👗', desc: 'Váy liền, đầm dự tiệc tinh tế' },
};

export const HomePage: React.FC = () => {
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

  const scrollCategoriesRef = useRef<HTMLDivElement>(null);
  const scrollBestSellersRef = useRef<HTMLDivElement>(null);
  const scrollMostViewedRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };
  
  const { useGetCategories } = useCategory();
  const { useGetFeaturedProducts } = useProduct();
  const { useGetActiveVouchers } = useVoucher();

  // Queries
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetCategories();
  const { data: featuredResponse, isLoading: isFeaturedLoading } = useGetFeaturedProducts();
  const { data: vouchers = [], isLoading: isVouchersLoading } = useGetActiveVouchers();

  const dbCategories = categoriesResponse?.data?.categories || [];
  const topSelling = featuredResponse?.data?.topSelling || [];
  const topViewed = featuredResponse?.data?.topViewed || [];

  return (
    <div className="bg-[#FAF8F5]">
      {/* ========== HERO BANNER ========== */}
      <section className="relative h-[80vh] min-h-[550px] overflow-hidden">
        <img
          src="/hero_banner.png"
          alt="Seoul Blanc Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center">
          <div className="max-w-xl text-white">
            <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-white/90 font-light mb-4 border border-white/40 px-3.5 py-1 rounded-md">
              BỘ SƯU TẬP HÈ 2026
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-wide leading-tight mb-6">
              Phong cách <br />
              <span className="font-medium">tối giản Hàn <br className="hidden sm:inline" />Quốc</span>
            </h1>
            <p className="text-base text-white/80 font-light leading-relaxed mb-8 max-w-md">
              Khám phá bộ sưu tập thời trang mới nhất lấy cảm hứng từ đường phố Seoul — nơi sự đơn giản gặp gỡ thanh lịch.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-white text-brand-900 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-brand-100 transition-all duration-300 shadow-md"
              >
                KHÁM PHÁ NGAY
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-4 border border-white/60 text-white text-xs uppercase tracking-widest font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                XEM SẢN PHẨM
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES BAR ========== */}
      <section className="bg-white border-y border-brand-200/50 py-5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <div className="text-brand-800 flex-shrink-0">{f.icon}</div>
                <div className="text-center sm:text-left">
                  <p className="text-[11px] font-semibold text-brand-900 uppercase tracking-widest">{f.title}</p>
                  <p className="text-[11px] text-brand-500 font-light mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ACTIVE VOUCHERS SECTION ========== */}
      {!isVouchersLoading && vouchers.length > 0 && (
        <section className="py-12 bg-white border-b border-brand-200/20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center mb-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-650 font-bold flex items-center justify-center gap-1.5">
                <Ticket size={12} className="text-brand-900" />
                MÃ GIẢM GIÁ KHUYẾN MÃI
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-brand-900 tracking-wider uppercase mt-2">
                Seoul Blanc <span className="font-semibold">Vouchers</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.slice(0, 3).map((voucher: any) => {
                const isPercent = voucher.discountType === 'PERCENT' || voucher.discountType === 'PERCENTAGE';
                return (
                  <div
                    key={voucher.id}
                    className="bg-white border border-brand-200/60 rounded-2xl overflow-hidden flex shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    {/* Ticket notch left decoration */}
                    <div className="bg-brand-900 text-white w-24 flex flex-col items-center justify-center p-3 text-center border-r border-dashed border-brand-250 relative flex-shrink-0">
                      <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#FAF8F5] rounded-full border border-brand-200/40"></div>
                      <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-3 h-3 bg-[#FAF8F5] rounded-full border border-brand-200/40"></div>
                      
                      <span className="text-[8px] tracking-wider uppercase font-bold text-brand-200">GIẢM</span>
                      <span className="text-sm font-extrabold mt-1 whitespace-nowrap">
                        {isPercent ? `${voucher.discountValue}%` : `${(voucher.discountValue / 1000).toFixed(0)}K`}
                      </span>
                    </div>

                    {/* Voucher Details */}
                    <div className="flex-1 p-4 flex flex-col justify-between text-left space-y-2">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-brand-950 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded tracking-wider font-mono">
                            {voucher.code}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(voucher.code);
                              toast.success(`Đã sao chép mã: ${voucher.code} 🎟️`);
                            }}
                            className="px-2.5 py-1 bg-brand-900 hover:bg-brand-850 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border-none"
                          >
                            Lưu mã
                          </button>
                        </div>
                        <p className="text-[11px] text-brand-650 font-light mt-1.5 line-clamp-2 leading-relaxed">
                          {voucher.description || `Đơn tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}₫.`}
                        </p>
                      </div>

                      <div className="text-[9px] text-brand-450 font-light border-t border-brand-100 pt-1.5 flex justify-between">
                        <span>Đơn tối thiểu: <strong>{voucher.minOrderValue.toLocaleString('vi-VN')}₫</strong></span>
                        <span>HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========== DYNAMIC CATEGORIES GRID ========== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-medium">BỘ SƯU TẬP</span>
            <h2 className="text-3xl sm:text-4xl font-light text-brand-900 tracking-wider uppercase mt-3">
              Danh mục <span className="font-semibold">sản phẩm</span>
            </h2>
          </div>

          {isCategoriesLoading && (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isCategoriesLoading && dbCategories.length > 0 && (
            <div className="relative group">
              <button 
                onClick={() => scrollLeft(scrollCategoriesRef)} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow border border-brand-200 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-brand-50"
              >
                <ChevronLeft size={20} className="text-brand-700" />
              </button>
 
              <div 
                ref={scrollCategoriesRef}
                className="flex overflow-x-auto gap-6 scrollbar-hide snap-x px-2 py-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {dbCategories.map((cat: Category) => {
                  const meta = categoryMeta[cat.type] || { emoji: '✨', desc: 'Sản phẩm thời trang tối giản' };
                  return (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="snap-start flex-none w-[280px] sm:w-[300px] group bg-white border border-brand-200/50 rounded-2xl p-6 hover:border-brand-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center h-64"
                    >
                      <div className="w-full flex-1 flex flex-col items-center justify-center">
                        {cat.image ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border border-brand-100 bg-brand-50 mb-3">
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="text-4xl mb-3">{meta.emoji}</div>
                        )}
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-900 mb-1 group-hover:text-brand-700 transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-brand-500 font-light leading-relaxed line-clamp-2 max-w-[200px]">
                          {cat.description || meta.desc}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-brand-600 group-hover:text-brand-900 transition-colors mt-2">
                        Xem sản phẩm
                        <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  );
                })}
              </div>
 
              <button 
                onClick={() => scrollRight(scrollCategoriesRef)} 
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow border border-brand-200 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-brand-50"
              >
                <ChevronRight size={20} className="text-brand-700" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========== BEST SELLERS SLIDER (TOP 10) ========== */}
      <section className="py-20 bg-white border-t border-brand-200/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-medium">XU HƯỚNG MUA SẮM</span>
              <h2 className="text-3xl font-light text-brand-900 tracking-wider uppercase mt-2">
                Sản phẩm <span className="font-semibold">bán chạy nhất</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollLeft(scrollBestSellersRef)}
                className="w-9 h-9 rounded-full border border-brand-200 flex items-center justify-center cursor-pointer hover:bg-brand-50 transition-colors"
              >
                <ChevronLeft size={16} className="text-brand-700" />
              </button>
              <button 
                onClick={() => scrollRight(scrollBestSellersRef)}
                className="w-9 h-9 rounded-full border border-brand-200 flex items-center justify-center cursor-pointer hover:bg-brand-50 transition-colors"
              >
                <ChevronRight size={16} className="text-brand-700" />
              </button>
            </div>
          </div>

          {isFeaturedLoading && (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isFeaturedLoading && topSelling.length === 0 && (
            <p className="text-center text-xs text-brand-400 font-light py-10">Chưa có sản phẩm bán chạy.</p>
          )}

          {!isFeaturedLoading && topSelling.length > 0 && (
            <div 
              ref={scrollBestSellersRef}
              className="flex overflow-x-auto gap-6 scrollbar-hide snap-x py-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {topSelling.map((product: Product) => (
                <div
                  key={product.id}
                  className="snap-start flex-none w-[260px] sm:w-[280px] group flex flex-col bg-[#FAF8F5] rounded-2xl overflow-hidden border border-brand-200/50 hover:shadow-md transition-all duration-300 relative"
                >
                  <Link to={`/products/${product.slug}`} className="aspect-[3/4] relative overflow-hidden bg-brand-100 block">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-300">
                        <ImageIcon size={28} />
                      </div>
                    )}
                    {product.discountPrice && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                        SALE
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-brand-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                      <Flame size={12} className="text-amber-400 fill-amber-400" />
                      Đã bán: {product.sold}
                    </span>
                  </Link>

                  {/* Toggle Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-brand-200/45 flex items-center justify-center shadow-xs z-10 transition-all duration-200 cursor-pointer hover:bg-white"
                    title={isFavorited(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <Heart
                      size={14}
                      className={`transition-colors duration-200 ${
                        isFavorited(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-brand-600 hover:text-red-500'
                      }`}
                    />
                  </button>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-brand-400 font-medium">
                        {product.categoryName || 'SEOUL BLANC'}
                      </span>
                      <Link to={`/products/${product.slug}`}>
                        <h4 className="text-xs sm:text-sm text-brand-900 font-light mt-1 mb-1.5 hover:text-brand-600 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                          {product.name}
                        </h4>
                      </Link>
                      {product.ratingAverage > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-semibold text-brand-700">
                            {product.ratingAverage.toFixed(1)}/5
                          </span>
                          <span className="text-[9px] text-brand-400">({product.totalReviews})</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-sm font-semibold text-brand-900">
                          {(product.discountPrice || product.price).toLocaleString('vi-VN')}₫
                        </span>
                        {product.discountPrice && (
                          <span className="text-xs text-brand-400 line-through">
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/products/${product.slug}`}
                        className="w-full py-2 bg-brand-900 hover:bg-brand-800 text-white text-[11px] uppercase tracking-widest font-semibold rounded-lg transition-colors flex items-center justify-center"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== MOST VIEWED SLIDER (TOP 10) ========== */}
      <section className="py-20 bg-[#FAF8F5] border-t border-brand-200/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-medium">ĐƯỢC QUAN TÂM NHẤT</span>
              <h2 className="text-3xl font-light text-brand-900 tracking-wider uppercase mt-2">
                Sản phẩm <span className="font-semibold">xem nhiều nhất</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollLeft(scrollMostViewedRef)}
                className="w-9 h-9 rounded-full border border-brand-200 bg-white flex items-center justify-center cursor-pointer hover:bg-brand-50 transition-colors"
              >
                <ChevronLeft size={16} className="text-brand-700" />
              </button>
              <button 
                onClick={() => scrollRight(scrollMostViewedRef)}
                className="w-9 h-9 rounded-full border border-brand-200 bg-white flex items-center justify-center cursor-pointer hover:bg-brand-50 transition-colors"
              >
                <ChevronRight size={16} className="text-brand-700" />
              </button>
            </div>
          </div>

          {isFeaturedLoading && (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isFeaturedLoading && topViewed.length === 0 && (
            <p className="text-center text-xs text-brand-400 font-light py-10">Chưa có sản phẩm được xem nhiều.</p>
          )}

          {!isFeaturedLoading && topViewed.length > 0 && (
            <div 
              ref={scrollMostViewedRef}
              className="flex overflow-x-auto gap-6 scrollbar-hide snap-x py-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {topViewed.map((product: Product) => (
                <div
                  key={product.id}
                  className="snap-start flex-none w-[260px] sm:w-[280px] group flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-200/50 hover:shadow-md transition-all duration-300 relative"
                >
                  <Link to={`/products/${product.slug}`} className="aspect-[3/4] relative overflow-hidden bg-brand-100 block">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-300">
                        <ImageIcon size={28} />
                      </div>
                    )}
                    {product.discountPrice && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                        SALE
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-brand-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                      <Eye size={12} className="text-brand-300" />
                      Lượt xem: {product.views}
                    </span>
                  </Link>

                  {/* Toggle Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-brand-200/45 flex items-center justify-center shadow-xs z-10 transition-all duration-200 cursor-pointer hover:bg-white"
                    title={isFavorited(product.id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <Heart
                      size={14}
                      className={`transition-colors duration-200 ${
                        isFavorited(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-brand-600 hover:text-red-500'
                      }`}
                    />
                  </button>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-brand-400 font-medium">
                        {product.categoryName || 'SEOUL BLANC'}
                      </span>
                      <Link to={`/products/${product.slug}`}>
                        <h4 className="text-xs sm:text-sm text-brand-900 font-light mt-1 mb-1.5 hover:text-brand-600 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                          {product.name}
                        </h4>
                      </Link>
                      {product.ratingAverage > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-semibold text-brand-700">
                            {product.ratingAverage.toFixed(1)}/5
                          </span>
                          <span className="text-[9px] text-brand-400">({product.totalReviews})</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-sm font-semibold text-brand-900">
                          {(product.discountPrice || product.price).toLocaleString('vi-VN')}₫
                        </span>
                        {product.discountPrice && (
                          <span className="text-xs text-brand-400 line-through">
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/products/${product.slug}`}
                        className="w-full py-2 bg-brand-900 hover:bg-brand-800 text-white text-[11px] uppercase tracking-widest font-semibold rounded-lg transition-colors flex items-center justify-center"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== CTA NEWSLETTER ========== */}
      <section className="py-20 bg-brand-900">
        <div className="max-w-2xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-light tracking-widest uppercase mb-4">
            Đăng ký nhận <span className="font-semibold">tin mới</span>
          </h2>
          <p className="text-xs text-white/60 font-light mb-8 max-w-md mx-auto leading-relaxed">
            Nhận thông tin về bộ sưu tập mới, ưu đãi đặc biệt và cảm hứng phong cách hàng tuần trực tiếp vào hộp thư của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors"
            />
            <button className="px-6 py-3.5 bg-white text-brand-900 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-brand-100 transition-colors cursor-pointer">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
