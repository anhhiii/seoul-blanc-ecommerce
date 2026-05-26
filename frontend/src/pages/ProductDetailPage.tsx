import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ShoppingBag, ArrowLeft, ShieldCheck, HelpCircle, ChevronLeft, Minus, Plus, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useProduct } from '../features/product/hooks/useProduct.js';
import { useCart } from '../features/cart/hooks/useCart.js';
import { useAuthStore } from '../store/authStore.js';
import { useWishlist } from '../features/wishlist/hooks/useWishlist.js';
import { useReview } from '../features/review/hooks/useReview.js';
import type { ColorType, SizeType, ProductVariant, Product } from '../features/product/types/index.js';

export const ProductDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const navigate = useNavigate();
  const { useGetProduct, useGetProducts } = useProduct();
  const { addToCart } = useCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { useGetWishlistIds, toggleWishlist } = useWishlist();
  const { data: wishlistIdsRes } = useGetWishlistIds();
  const wishlistIds = wishlistIdsRes?.data?.productIds || [];

  // Fetch product detail query
  const { data: response, isLoading, isError } = useGetProduct(idOrSlug || '');
  const product = response?.data?.product;

  const { useGetProductReviews } = useReview();
  const { data: reviews = [], isLoading: isLoadingReviews } = useGetProductReviews(product?.id || '');

  const isProductFavorited = product?.id ? wishlistIds.includes(product.id) : false;

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
      navigate('/login');
      return;
    }
    if (product?.id) {
      toggleWishlist.mutate(product.id);
    }
  };

  // Fetch related products query
  const { data: relatedResponse } = useGetProducts({ 
    categoryId: product?.categoryId, 
    limit: 5 
  });
  const relatedProducts = (relatedResponse?.data?.products || [])
    .filter((p: Product) => p.id !== product?.id)
    .slice(0, 4);

  // Selected Variant states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeType | null>(null);

  // Reset selections and scroll to top when navigating to a different product
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImage(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
  }, [idOrSlug]);

  const [quantity, setQuantity] = useState(1);
  const displayImage = selectedImage || product?.thumbnail || '';
  const activeColor = selectedColor || product?.variants?.[0]?.color || null;
  const activeSize = selectedSize || product?.variants?.[0]?.size || null;

  // Extract unique colors and sizes available for this product
  const availableColors = product
    ? Array.from(new Set(product.variants.map((v: ProductVariant) => v.color)))
    : [];

  const availableSizes = product
    ? Array.from(new Set(product.variants.map((v: ProductVariant) => v.size)))
    : [];

  // Find stock matching selected color and size
  const activeVariant = product?.variants.find(
    (v: ProductVariant) => v.color === activeColor && v.size === activeSize
  );
  const stockInfo = activeVariant ? activeVariant.stock : 0;

  // Derive final quantity to avoid cascading render effects
  const actualQuantity = stockInfo === 0 ? 1 : Math.min(quantity, stockInfo);

  const handleDecreaseQuantity = () => {
    if (actualQuantity > 1) setQuantity(actualQuantity - 1);
  };

  const handleIncreaseQuantity = () => {
    if (actualQuantity < stockInfo) setQuantity(actualQuantity + 1);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    if (!activeVariant || !activeVariant.id) {
      toast.error('Vui lòng chọn màu sắc và kích thước!');
      return;
    }
    addToCart.mutate({
      productVariantId: activeVariant.id,
      quantity: actualQuantity,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }
    if (!activeVariant || !activeVariant.id) {
      toast.error('Vui lòng chọn màu sắc và kích thước!');
      return;
    }
    addToCart.mutate(
      {
        productVariantId: activeVariant.id,
        quantity: actualQuantity,
      },
      {
        onSuccess: () => {
          navigate('/cart');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brand-400 font-light">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-12">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-brand-200/30 shadow-sm space-y-4">
          <AlertTriangle className="text-red-500 mx-auto" size={36} />
          <h2 className="text-sm font-semibold text-brand-900">Không tìm thấy sản phẩm</h2>
          <p className="text-xs text-brand-500 font-light">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị ẩn khỏi cửa hàng.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs bg-brand-900 text-white font-semibold px-4 py-2.5 rounded-lg"
          >
            <ArrowLeft size={12} />
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  // Gallery list (main thumbnail + album images)
  const albumImages = [product.thumbnail, ...product.images];

  const handlePrevImage = () => {
    const currentIndex = albumImages.indexOf(displayImage);
    const prevIndex = (currentIndex - 1 + albumImages.length) % albumImages.length;
    setSelectedImage(albumImages[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = albumImages.indexOf(displayImage);
    const nextIndex = (currentIndex + 1) % albumImages.length;
    setSelectedImage(albumImages[nextIndex]);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="text-[10px] uppercase tracking-widest text-brand-500 font-medium mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-900 transition-colors">Trang chủ</Link>
          <ChevronRight size={10} className="text-brand-300" />
          <Link to="/products" className="hover:text-brand-900 transition-colors">Sản phẩm</Link>
          <ChevronRight size={10} className="text-brand-300" />
          <span className="text-brand-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-brand-200/20 p-6 sm:p-8 shadow-xs">
          
          {/* ================= LEFT COLUMN: IMAGES GALLERY ================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Big active display image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-brand-200/50 bg-brand-50 group">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              
              {/* Image Navigation Buttons */}
              {albumImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow border border-brand-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-white"
                  >
                    <ChevronLeft size={20} className="text-brand-700" />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full shadow border border-brand-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-white"
                  >
                    <ChevronRight size={20} className="text-brand-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails grid */}
            <div className="flex gap-3 overflow-x-auto pb-1 select-none">
              {albumImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] rounded-xl overflow-hidden bg-brand-50 border transition-all flex-shrink-0 cursor-pointer ${
                    displayImage === img ? 'border-brand-900 scale-98 shadow-sm' : 'border-brand-200/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT META & ORDERING ================= */}
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
                <span className="flex items-center gap-1.5 font-medium"><ShoppingBag size={14} /> Đã bán {product.sold || 0}</span>
                <span className="w-1 h-1 rounded-full bg-brand-200"></span>
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
                Trạng thái: {' '}
                <strong className="font-semibold text-brand-900">
                  {stockInfo > 0
                    ? `Còn ${stockInfo} sản phẩm trong kho`
                    : 'Hết hàng'}
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
                    onClick={handleDecreaseQuantity}
                    disabled={actualQuantity <= 1 || stockInfo <= 0}
                    className="w-10 h-full flex items-center justify-center bg-brand-50 hover:bg-brand-100 text-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-brand-900">{actualQuantity}</span>
                  <button 
                    onClick={handleIncreaseQuantity}
                    disabled={actualQuantity >= stockInfo || stockInfo <= 0}
                    className="w-10 h-full flex items-center justify-center bg-brand-50 hover:bg-brand-100 text-brand-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled={stockInfo <= 0 || addToCart.isPending}
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-white border border-brand-900 text-brand-900 hover:bg-brand-50/40 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  {addToCart.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  Thêm vào giỏ hàng
                </button>
                
                 <button
                  disabled={stockInfo <= 0 || addToCart.isPending}
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:pointer-events-none"
                >
                  {addToCart.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  Mua ngay
                </button>

                {/* Wishlist Toggle Button */}
                <button
                  onClick={handleToggleWishlist}
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
            </div>

            {/* Brand benefits */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-brand-500 font-light">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="text-brand-500" size={14} />
                <span>100% chính hãng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="text-brand-500" size={14} />
                <span>Hỗ trợ đổi size 30 ngày</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========== PRODUCT REVIEWS ========== */}
        <div className="mt-16 bg-white rounded-3xl border border-brand-200/20 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-brand-100 pb-5 mb-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-brand-900 tracking-wide">
                Đánh giá khách hàng
              </h3>
              <p className="text-xs text-brand-500 font-light mt-0.5">
                Xem đánh giá từ các khách hàng đã mua sản phẩm này
              </p>
            </div>
            {product && product.totalReviews > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500 gap-1 font-bold text-lg">
                  <Star className="fill-amber-400 text-amber-400" size={20} />
                  <span>{product.ratingAverage}</span>
                </div>
                <span className="text-brand-300 text-lg font-light">|</span>
                <span className="text-xs text-brand-500 font-light">
                  {product.totalReviews} lượt đánh giá
                </span>
              </div>
            )}
          </div>

          {isLoadingReviews ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-brand-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-brand-400 font-light">Đang tải đánh giá...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-brand-400 font-light">
                Sản phẩm này chưa có đánh giá nào. Hãy mua sản phẩm và chia sẻ cảm nhận đầu tiên của bạn!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-brand-100 space-y-6">
              {reviews.map((rev: any) => {
                const formattedRevDate = new Date(rev.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                });
                return (
                  <div key={rev.id} className="pt-6 first:pt-0 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-brand-200">
                      {rev.user?.avatar ? (
                        <img src={rev.user.avatar} alt={rev.user?.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-brand-700 uppercase">
                          {rev.user?.fullName?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 text-left">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-xs font-semibold text-brand-950">{rev.user?.fullName || 'Khách hàng ẩn danh'}</h4>
                        <span className="text-[10px] text-brand-400 font-light">{formattedRevDate}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-brand-250"}
                          />
                        ))}
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-brand-700 font-light leading-relaxed pt-0.5">
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========== RELATED PRODUCTS ========== */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 border-t border-brand-200/50 pt-16">
            <div className="text-center mb-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-medium">CÙNG DANH MỤC</span>
              <h2 className="text-2xl sm:text-3xl font-light text-brand-900 tracking-wider mt-2">
                Sản phẩm <span className="font-semibold">tương tự</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProd: Product) => (
                <Link
                  key={relatedProd.id}
                  to={`/products/${relatedProd.slug}`}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-100 hover:border-brand-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] bg-brand-50 overflow-hidden">
                    <img
                      src={relatedProd.thumbnail}
                      alt={relatedProd.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    {relatedProd.discountPrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider z-10">
                        SALE
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] uppercase tracking-widest text-brand-500 mb-1">
                      {relatedProd.categoryName || 'Sản phẩm'}
                    </span>
                    <h3 className="text-sm font-semibold text-brand-900 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
                      {relatedProd.name}
                    </h3>
                    {relatedProd.ratingAverage > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-semibold text-brand-700">
                          {relatedProd.ratingAverage.toFixed(1)}/5
                        </span>
                        <span className="text-[9px] text-brand-400">({relatedProd.totalReviews})</span>
                      </div>
                    )}
                    <div className="mt-auto flex items-center gap-2">
                      <span className="font-bold text-brand-900">
                        {(relatedProd.discountPrice || relatedProd.price).toLocaleString('vi-VN')}₫
                      </span>
                      {relatedProd.discountPrice && (
                        <span className="text-xs text-brand-400 line-through">
                          {relatedProd.price.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
