import React from 'react';
import { ShoppingBag, Star, Minus, Plus, Heart, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import type { Product } from '../../types/index.js';
import { useSettings } from '../../../../shared/hooks/useSettings.js';

export interface ProductInfoProps {
  product: Product;
  activeColor: string;
  setSelectedColor: (color: string) => void;
  availableColors: string[];
  activeSize: string;
  setSelectedSize: (size: string) => void;
  availableSizes: string[];
  stockInfo: number;
  actualQuantity: number;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isAddToCartPending: boolean;
  isProductFavorited: boolean;
  onToggleWishlist: () => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  activeColor,
  setSelectedColor,
  availableColors,
  activeSize,
  setSelectedSize,
  availableSizes,
  stockInfo,
  actualQuantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  onBuyNow,
  isAddToCartPending,
  isProductFavorited,
  onToggleWishlist,
}) => {
  const { settings } = useSettings();
  const freeshipThresholdText =
    settings.freeShippingThreshold >= 1000000
      ? `Freeship từ ${(settings.freeShippingThreshold / 1000000).toLocaleString('vi-VN')} triệu`
      : `Freeship từ ${settings.freeShippingThreshold.toLocaleString('vi-VN')}₫`;

  return (
    <div className="lg:col-span-6 space-y-6">
      {/* Title & Brand */}
      <div>
        <span className="inline-block text-[10px] uppercase tracking-widest text-brand-500 bg-brand-50 border border-brand-200/50 px-2.5 py-1 rounded-md font-semibold mb-3">
          {product.categoryName || 'SEOUL BLANC'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-light text-brand-900 tracking-wide leading-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-4 mt-3 text-xs text-brand-500 font-light">
          <span className="flex items-center gap-1.5 font-medium">
            <ShoppingBag size={14} /> Đã bán {product.sold || 0}
          </span>
          <span className="w-1 h-1 rounded-full bg-brand-200" />
          {/* Star rating display */}
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={`${
                    star <= Math.round(product.ratingAverage || 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-brand-100 text-brand-200'
                  }`}
                />
              ))}
            </span>
            <span className="font-medium text-brand-700">
              {product.ratingAverage ? product.ratingAverage.toFixed(1) : '0.0'}
            </span>
            <span className="text-brand-400">({product.totalReviews || 0} đánh giá)</span>
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex items-baseline gap-3 border-y border-brand-100 py-4">
        <span className="text-2xl font-bold text-brand-900">
          {(product.discountPrice || product.price).toLocaleString('vi-VN')}₫
        </span>
        {product.discountPrice && (
          <span className="text-sm text-brand-400 line-through">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
        )}
      </div>

      {/* Select Color Variant */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
          Màu sắc: <span className="font-semibold text-brand-900">{activeColor || 'Chưa chọn'}</span>
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all border cursor-pointer ${
                activeColor === color
                  ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                  : 'border-brand-200/60 bg-white text-brand-700 hover:border-brand-400'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Select Size Variant */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
          Kích thước: <span className="font-semibold text-brand-900">{activeSize || 'Chưa chọn'}</span>
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-12 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                activeSize === size
                  ? 'border-brand-900 bg-brand-900 text-white shadow-xs'
                  : 'border-brand-200/60 bg-white text-brand-700 hover:border-brand-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock details */}
      <div className="text-xs text-brand-500 font-light flex items-center gap-1.5 bg-brand-50/50 p-3 rounded-xl border border-brand-100/50">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
        <span>
          Trạng thái:{' '}
          <strong className="font-semibold text-brand-900">
            {stockInfo > 0 ? `Còn ${stockInfo} sản phẩm trong kho` : 'Hết hàng'}
          </strong>
        </span>
      </div>

      {/* Select Quantity & Call to Actions */}
      <div className="pt-2 flex flex-col gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">Số lượng:</span>
          <div className="flex items-center border border-brand-200 rounded-lg overflow-hidden h-10">
            <button
              onClick={onDecreaseQuantity}
              disabled={actualQuantity <= 1 || stockInfo <= 0}
              className="w-10 h-full flex items-center justify-center bg-brand-50 hover:bg-brand-100 text-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="w-12 text-center text-sm font-semibold text-brand-900">{actualQuantity}</span>
            <button
              onClick={onIncreaseQuantity}
              disabled={actualQuantity >= stockInfo || stockInfo <= 0}
              className="w-10 h-full flex items-center justify-center bg-brand-50 hover:bg-brand-100 text-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled={stockInfo <= 0 || isAddToCartPending}
            onClick={onAddToCart}
            className="flex-1 py-4 bg-white border border-brand-900 text-brand-900 hover:bg-brand-50/40 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            {isAddToCartPending ? (
              <div className="w-3.5 h-3.5 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingBag size={14} />
            )}
            Thêm vào giỏ hàng
          </button>

          <button
            disabled={stockInfo <= 0 || isAddToCartPending}
            onClick={onBuyNow}
            className="flex-1 py-4 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            Mua ngay
          </button>

          {/* Wishlist Toggle Button */}
          <button
            onClick={onToggleWishlist}
            className={`px-5 py-4 rounded-xl transition-all flex items-center justify-center border cursor-pointer ${
              isProductFavorited
                ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100/50'
                : 'border-brand-200 bg-white text-brand-650 hover:bg-brand-50'
            }`}
            title={isProductFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart size={16} className={isProductFavorited ? 'fill-red-500 text-red-500' : 'text-brand-600'} />
          </button>
        </div>
      </div>

      {/* Product description & Fabric details */}
      <div className="border-t border-brand-150 pt-6 space-y-4">
        <div>
          <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-2">Thông tin sản phẩm</h4>
          <p className="text-xs text-brand-600 font-light leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Product specifications */}
        <div className="grid grid-cols-2 gap-4 text-xs font-light bg-brand-50/40 p-4 rounded-2xl border border-brand-100/50">
          {product.material && (
            <div>
              <span className="text-brand-400">Chất liệu:</span>{' '}
              <strong className="font-medium text-brand-800">{product.material}</strong>
            </div>
          )}
          {product.fit && (
            <div>
              <span className="text-brand-400">Form dáng:</span>{' '}
              <strong className="font-medium text-brand-800">{product.fit}</strong>
            </div>
          )}
          {product.style && (
            <div>
              <span className="text-brand-400">Phong cách:</span>{' '}
              <strong className="font-medium text-brand-800">{product.style}</strong>
            </div>
          )}
        </div>

        {/* Brand commitments */}
        <div className="border-t border-brand-100 pt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 space-y-1">
            <Truck size={16} className="mx-auto text-brand-500" />
            <span className="text-[10px] text-brand-600 font-medium block">{freeshipThresholdText}</span>
          </div>
          <div className="p-2 space-y-1 border-x border-brand-100">
            <RefreshCw size={16} className="mx-auto text-brand-500" />
            <span className="text-[10px] text-brand-600 font-medium block">Đổi hàng 7 ngày</span>
          </div>
          <div className="p-2 space-y-1">
            <ShieldCheck size={16} className="mx-auto text-brand-500" />
            <span className="text-[10px] text-brand-600 font-medium block">Hàng chính hãng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;

