import React from 'react';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../features/wishlist/hooks/useWishlist.js';
import type { Product } from '../../features/product/types/index.js';

export const WishlistPage: React.FC = () => {
  const { useGetWishlist, toggleWishlist } = useWishlist();
  const { data: wishlistRes, isLoading, isError } = useGetWishlist();
  const wishlist = wishlistRes?.data?.wishlist || [];

  const handleRemove = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-brand-500 font-light">Đang tải sản phẩm yêu thích...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs min-h-[300px] flex flex-col items-center justify-center">
        <Heart className="text-red-400 mb-4 animate-pulse" size={32} />
        <h3 className="text-sm font-semibold text-brand-900 mb-1">Đã xảy ra lỗi</h3>
        <p className="text-xs text-brand-500 font-light max-w-xs mb-6">
          Không thể đồng bộ danh sách yêu thích của bạn lúc này. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs min-h-[350px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="text-brand-350" size={28} />
        </div>
        <h2 className="text-base font-medium text-brand-900 tracking-wide mb-2">Danh sách yêu thích trống</h2>
        <p className="text-xs text-brand-500 font-light mb-8 leading-relaxed max-w-sm mx-auto">
          Hãy thêm các sản phẩm yêu thích của bạn khi mua sắm để lưu trữ và xem lại chúng tại đây bất cứ lúc nào.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs"
        >
          <span>Khám phá sản phẩm</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-semibold text-brand-900 tracking-wide">Sản phẩm yêu thích</h2>
        <p className="text-xs text-brand-500 font-light mt-1">
          Danh sách lưu giữ các sản phẩm thiết kế bạn yêu thích ({wishlist.length} sản phẩm).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product: Product) => {
          const discountPrice = product.discountPrice;
          const originalPrice = product.price;
          const displayPrice = discountPrice || originalPrice;

          return (
            <div
              key={product.id}
              className="group flex flex-col bg-[#FAF8F5]/50 border border-brand-200/30 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 relative"
            >
              {/* Thumbnail */}
              <Link to={`/products/${product.slug}`} className="aspect-[3/4] relative overflow-hidden bg-brand-50 block">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                />
                {discountPrice && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded shadow-xs">
                    SALE
                  </span>
                )}
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(product.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-brand-200/35 hover:bg-red-50 hover:text-red-500 hover:border-red-100 flex items-center justify-center text-brand-500 shadow-xs z-10 transition-all duration-200 cursor-pointer"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  <Trash2 size={13} />
                </button>
              </Link>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-brand-400 font-medium">
                    {product.categoryName || 'SEOUL BLANC'}
                  </span>
                  <Link to={`/products/${product.slug}`}>
                    <h4 className="text-xs sm:text-sm text-brand-900 font-light mt-1 mb-2 hover:text-brand-600 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                      {product.name}
                    </h4>
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-brand-900">
                      {displayPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {discountPrice && (
                      <span className="text-[11px] text-brand-400 line-through">
                        {originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/products/${product.slug}`}
                    className="w-full py-2.5 bg-brand-900 hover:bg-brand-850 text-white text-[10px] uppercase tracking-widest font-semibold rounded-xl transition-all flex items-center justify-center gap-1 group/btn"
                  >
                    Xem sản phẩm
                    <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
