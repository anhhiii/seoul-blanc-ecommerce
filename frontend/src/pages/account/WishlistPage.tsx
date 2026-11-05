import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../features/wishlist/hooks/useWishlist.js';
import { ProductCard } from '../../features/product/components/client/index.js';
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
        {wishlist.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorited={true}
            onToggleWishlist={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
