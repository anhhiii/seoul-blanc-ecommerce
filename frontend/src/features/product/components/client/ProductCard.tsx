import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Heart, ArrowRight, Flame, ImageIcon } from 'lucide-react';
import type { Product } from '../../types/index.js';

export interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleWishlist?: (id: string) => void;
  showWishlist?: boolean;
  badgeIcon?: 'flame' | 'none';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorited = false,
  onToggleWishlist,
  showWishlist = true,
  badgeIcon = 'none',
  className = '',
}) => {
  return (
    <div
      className={`group flex flex-col bg-white border border-brand-200/40 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 relative ${className}`}
    >
      {/* Thumbnail Image */}
      <Link
        to={`/products/${product.slug}`}
        className="aspect-[3/4] relative overflow-hidden bg-brand-50 block"
      >
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-300">
            <ImageIcon size={28} />
          </div>
        )}

        {/* Sale Tag */}
        {product.discountPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded shadow-xs z-10">
            SALE
          </span>
        )}

        {/* Sold Count Badge on Thumbnail */}
        <span className="absolute bottom-2.5 right-2.5 bg-brand-900/80 backdrop-blur-xs text-white text-[9px] px-2.5 py-1 rounded-md flex items-center gap-1 font-medium z-10">
          {badgeIcon === 'flame' && <Flame size={12} className="text-amber-400 fill-amber-400" />}
          Đã bán: {product.sold || 0}
        </span>
      </Link>

      {/* Wishlist Button */}
      {showWishlist && onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-brand-200/45 flex items-center justify-center shadow-xs z-10 transition-all duration-200 cursor-pointer hover:bg-white"
          title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart
            size={14}
            className={`transition-colors duration-200 ${
              isFavorited
                ? 'fill-red-500 text-red-500'
                : 'text-brand-600 hover:text-red-500'
            }`}
          />
        </button>
      )}

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-brand-400 font-medium">
            {product.categoryName || 'Seoul Blanc'}
          </span>
          <Link to={`/products/${product.slug}`}>
            <h4 className="text-xs sm:text-sm text-brand-900 font-light mt-1 mb-2 hover:text-brand-600 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
              {product.name}
            </h4>
          </Link>
        </div>

        {/* Rating & View Count */}
        <div className="flex items-center justify-between text-[10px] text-brand-500 mb-2">
          {product.ratingAverage > 0 ? (
            <div className="flex items-center gap-1">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-brand-700">
                {product.ratingAverage.toFixed(1)}/5
              </span>
              <span className="text-[9px] text-brand-400 ml-0.5">
                ({product.totalReviews})
              </span>
            </div>
          ) : (
            <span className="text-[9px] text-brand-400">Chưa có đánh giá</span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-brand-500 font-light">
            <Eye size={12} className="text-brand-400" />
            {product.views || 0} lượt xem
          </span>
        </div>

        {/* Price & Action */}
        <div>
          <div className="flex items-baseline gap-2 mb-3.5">
            <span className="text-sm font-semibold text-brand-900">
              {(product.discountPrice || product.price).toLocaleString('vi-VN')}₫
            </span>
            {product.discountPrice && (
              <span className="text-[11px] text-brand-400 line-through">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="w-full py-2 bg-brand-900 hover:bg-brand-850 text-white text-[10px] uppercase tracking-widest font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 group/btn"
          >
            Xem chi tiết
            <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

