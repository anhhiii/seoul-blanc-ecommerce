import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useProduct } from '../features/product/hooks/useProduct.js';
import { useCart } from '../features/cart/hooks/useCart.js';
import { useAuthStore } from '../store/authStore.js';
import { useWishlist } from '../features/wishlist/hooks/useWishlist.js';
import { useReview } from '../features/review/hooks/useReview.js';
import {
  ProductGallery,
  ProductInfo,
  ProductReviews,
  ProductCard,
} from '../features/product/components/client/index.js';
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

  // Selected Variant States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Reviews query
  const { useGetProductReviews } = useReview();
  const { data: reviews = [], isLoading: isLoadingReviews } = useGetProductReviews(product?.id || '');

  // Similar Products query
  const { data: similarData } = useGetProducts(
    { categoryId: product?.categoryId, limit: 4 },
    { enabled: !!product?.categoryId }
  );
  const relatedProducts = (similarData?.data?.products || []).filter(
    (p: Product) => p.id !== product?.id
  );

  const isProductFavorited = !!product && wishlistIds.includes(product.id);

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
      navigate('/login');
      return;
    }
    if (product?.id) {
      toggleWishlist.mutate(product.id);
    }
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
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl border border-brand-200/30 shadow-xs space-y-4">
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

  // Extract available colors and sizes
  const availableColors = Array.from(
    new Set(product.variants.map((v: ProductVariant) => v.color))
  ) as ColorType[];
  const availableSizes = Array.from(
    new Set(product.variants.map((v: ProductVariant) => v.size))
  ) as SizeType[];

  // Active selections (fallback to first available if not chosen)
  const activeColor = selectedColor || (availableColors[0] as string);
  const activeSize = selectedSize || (availableSizes[0] as string);

  const activeVariant = product.variants.find(
    (v: ProductVariant) => v.color === activeColor && v.size === activeSize
  );
  const stockInfo = activeVariant ? activeVariant.stock : 0;
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
    if (stockInfo <= 0) {
      toast.error('Sản phẩm đã hết hàng trong kho!');
      return;
    }

    const itemPrice = product.discountPrice ?? product.price;

    navigate('/checkout', {
      state: {
        directItem: {
          productVariantId: activeVariant.id,
          quantity: actualQuantity,
          price: itemPrice,
          variant: {
            id: activeVariant.id,
            size: activeVariant.size,
            color: activeVariant.color,
            stock: activeVariant.stock,
            sku: activeVariant.sku,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              thumbnail: product.thumbnail,
              price: product.price,
              discountPrice: product.discountPrice,
            },
          },
        },
      },
    });
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="text-[10px] uppercase tracking-widest text-brand-500 font-medium mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-900 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={10} className="text-brand-300" />
          <Link to="/products" className="hover:text-brand-900 transition-colors">
            Sản phẩm
          </Link>
          <ChevronRight size={10} className="text-brand-300" />
          <span className="text-brand-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-brand-200/20 p-6 sm:p-8 shadow-xs">
          {/* Gallery Component */}
          <ProductGallery
            thumbnail={product.thumbnail}
            images={product.images || []}
            productName={product.name}
          />

          {/* Info & Purchase Component */}
          <ProductInfo
            product={product}
            activeColor={activeColor}
            setSelectedColor={setSelectedColor}
            availableColors={availableColors}
            activeSize={activeSize}
            setSelectedSize={setSelectedSize}
            availableSizes={availableSizes}
            stockInfo={stockInfo}
            actualQuantity={actualQuantity}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isAddToCartPending={addToCart.isPending}
            isProductFavorited={isProductFavorited}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>

        {/* Reviews Component */}
        <ProductReviews
          ratingAverage={product.ratingAverage || 0}
          totalReviews={product.totalReviews || 0}
          reviews={reviews}
          isLoading={isLoadingReviews}
        />

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 border-t border-brand-200/50 pt-16">
            <div className="text-center mb-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-medium">
                CÙNG DANH MỤC
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-brand-900 tracking-wider mt-2">
                Sản phẩm <span className="font-semibold">tương tự</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProd: Product) => (
                <ProductCard
                  key={relatedProd.id}
                  product={relatedProd}
                  isFavorited={wishlistIds.includes(relatedProd.id)}
                  onToggleWishlist={() => toggleWishlist.mutate(relatedProd.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
