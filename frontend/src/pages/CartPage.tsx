import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../features/cart/hooks/useCart.js';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { useGetCart, updateCartItem, removeFromCart, clearCart, isAuthenticated } = useCart();

  const { data: cartResponse, isLoading } = useGetCart();
  const cart = cartResponse?.data?.cart;
  const items = cart?.items || [];

  // ── Selection state ──────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // When items load, auto-select all
  useEffect(() => {
    if (items.length > 0) {
      setSelectedIds(new Set(items.map((i) => i.productVariantId)));
    }
  }, [cart]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.productVariantId)));
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Derived totals from selected items ───────────────────────────────────────
  const selectedItems = items.filter((i) => selectedIds.has(i.productVariantId));
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = selectedSubtotal >= 1000000 || selectedSubtotal === 0 ? 0 : 30000;
  const finalTotal = selectedSubtotal + shippingFee;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUpdateQuantity = (productVariantId: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.warning(`Sản phẩm này chỉ còn tối đa ${stock} mặt hàng trong kho.`);
      return;
    }
    updateCartItem.mutate({ productVariantId, quantity: newQty });
  };

  const handleRemoveItem = (productVariantId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      removeFromCart.mutate(productVariantId);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(productVariantId); return n; });
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      clearCart.mutate();
      setSelectedIds(new Set());
    }
  };

  // ── Auth / Loading guards ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-brand-200/50 rounded-3xl p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-brand-400" size={28} />
          </div>
          <h2 className="text-lg font-light text-brand-900 tracking-wide mb-3">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-brand-550 font-light mb-8 leading-relaxed">
            Vui lòng đăng nhập tài khoản của bạn để xem và quản lý các sản phẩm trong giỏ hàng.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brand-400 font-light">Đang tải giỏ hàng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* Title */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-brand-900 uppercase">
            Giỏ Hàng
          </h1>
          <p className="text-xs text-brand-400 font-light mt-1.5">
            Quản lý các sản phẩm bạn đã chọn trước khi thanh toán
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-brand-200/20 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-brand-400" size={26} />
            </div>
            <h2 className="text-base font-light text-brand-900 tracking-wide mb-2">Giỏ hàng trống</h2>
            <p className="text-xs text-brand-500 font-light mb-8 leading-relaxed">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá bộ sưu tập thời trang của Seoul Blanc và lựa chọn món đồ yêu thích của mình.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft size={12} />
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left side: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-brand-200/25 overflow-hidden shadow-xs">

                {/* Header row with Select-All */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-brand-50/50 border-b border-brand-100 text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                  {/* Checkbox select all */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={toggleAll}
                      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                        isAllSelected
                          ? 'bg-brand-900 border-brand-900'
                          : isIndeterminate
                            ? 'bg-brand-200 border-brand-400'
                            : 'bg-white border-brand-300 hover:border-brand-600'
                      }`}
                      title={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    >
                      {isAllSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                      {isIndeterminate && <span className="w-2 h-0.5 bg-brand-700 rounded-full" />}
                    </button>
                  </div>
                  <div className="col-span-5">Sản phẩm ({items.length})</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Tổng</div>
                </div>

                {/* Mobile: select-all bar */}
                <div className="sm:hidden flex items-center gap-3 px-5 py-3.5 border-b border-brand-100 bg-brand-50/50">
                  <button
                    onClick={toggleAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      isAllSelected
                        ? 'bg-brand-900 border-brand-900'
                        : isIndeterminate
                          ? 'bg-brand-200 border-brand-400'
                          : 'bg-white border-brand-300'
                    }`}
                  >
                    {isAllSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                    {isIndeterminate && <span className="w-2 h-0.5 bg-brand-700 rounded-full" />}
                  </button>
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${items.length} sản phẩm)`}
                  </span>
                  {selectedIds.size > 0 && (
                    <span className="ml-auto text-[9px] font-semibold text-brand-500">
                      Đã chọn {selectedIds.size}/{items.length}
                    </span>
                  )}
                </div>

                {/* Items loop */}
                <div className="divide-y divide-brand-100">
                  {items.map((item) => {
                    const product = item.variant?.product;
                    const variant = item.variant;
                    if (!product || !variant) return null;

                    const isSelected = selectedIds.has(item.productVariantId);

                    return (
                      <div
                        key={item.productVariantId}
                        className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-5 sm:p-6 transition-colors ${
                          isSelected ? 'bg-white hover:bg-brand-50/10' : 'bg-brand-50/30 hover:bg-brand-50/50 opacity-70'
                        }`}
                      >
                        {/* Checkbox — desktop (col 1) */}
                        <div className="hidden sm:flex col-span-1 items-center justify-center">
                          <button
                            onClick={() => toggleItem(item.productVariantId)}
                            className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                              isSelected
                                ? 'bg-brand-900 border-brand-900'
                                : 'bg-white border-brand-300 hover:border-brand-600'
                            }`}
                          >
                            {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                          </button>
                        </div>

                        {/* Info details — desktop col-span-5, mobile full */}
                        <div className="col-span-1 sm:col-span-5 flex gap-3">
                          {/* Checkbox mobile (inline with image) */}
                          <button
                            onClick={() => toggleItem(item.productVariantId)}
                            className={`sm:hidden w-5 h-5 mt-1 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 self-start ${
                              isSelected
                                ? 'bg-brand-900 border-brand-900'
                                : 'bg-white border-brand-300'
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                          </button>

                          <Link
                            to={`/products/${product.slug || product.id}`}
                            className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-brand-50 border border-brand-200/40 flex-shrink-0"
                          >
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <div className="flex flex-col justify-center min-w-0">
                            <Link
                              to={`/products/${product.slug || product.id}`}
                              className="text-sm font-light text-brand-900 hover:text-brand-650 transition-colors line-clamp-2 leading-snug"
                            >
                              {product.name}
                            </Link>

                            {/* Variant badges */}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-[9px] uppercase tracking-wider text-brand-500 bg-brand-50 border border-brand-200/50 px-2 py-0.5 rounded-md font-semibold">
                                Size: {variant.size}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-brand-500 bg-brand-50 border border-brand-200/50 px-2 py-0.5 rounded-md font-semibold">
                                Màu: {variant.color}
                              </span>
                            </div>

                            {/* Remove (mobile) */}
                            <button
                              onClick={() => handleRemoveItem(item.productVariantId)}
                              className="sm:hidden text-left text-red-500 hover:text-red-700 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 mt-2.5 transition-colors cursor-pointer"
                            >
                              <Trash2 size={11} />
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* Unit price */}
                        <div className="col-span-1 sm:col-span-2 text-left sm:text-center flex sm:block justify-between items-center sm:border-0 border-t border-brand-100/55 pt-2 sm:pt-0">
                          <span className="sm:hidden text-[10px] font-bold text-brand-800 uppercase">Đơn giá:</span>
                          <span className="text-xs font-semibold text-brand-900">
                            {item.price.toLocaleString('vi-VN')}₫
                          </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="col-span-1 sm:col-span-2 flex sm:justify-center items-center justify-between sm:border-0 border-t border-brand-100/55 pt-2 sm:pt-0">
                          <span className="sm:hidden text-[10px] font-bold text-brand-800 uppercase">Số lượng:</span>
                          <div className="flex items-center border border-brand-200 rounded-lg overflow-hidden h-8 bg-white">
                            <button
                              onClick={() => handleUpdateQuantity(item.productVariantId, item.quantity, -1, variant.stock)}
                              disabled={item.quantity <= 1 || updateCartItem.isPending}
                              className="w-8 h-full flex items-center justify-center hover:bg-brand-50 text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-brand-900">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productVariantId, item.quantity, 1, variant.stock)}
                              disabled={item.quantity >= variant.stock || updateCartItem.isPending}
                              className="w-8 h-full flex items-center justify-center hover:bg-brand-50 text-brand-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Line total + delete */}
                        <div className="col-span-1 sm:col-span-2 text-right flex sm:block justify-between items-center sm:border-0 border-t border-brand-100/55 pt-2 sm:pt-0">
                          <span className="sm:hidden text-[10px] font-bold text-brand-800 uppercase">Tổng:</span>
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 justify-end w-full">
                            <span className="text-xs font-bold text-brand-900">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.productVariantId)}
                              disabled={removeFromCart.isPending}
                              className="hidden sm:inline-flex text-brand-400 hover:text-red-500 transition-colors p-1 cursor-pointer disabled:opacity-40"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border border-brand-200/20 p-5 rounded-2xl shadow-xs">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-700 hover:text-brand-900 transition-colors"
                >
                  <ArrowLeft size={12} />
                  Tiếp tục mua sắm
                </Link>

                <button
                  onClick={handleClearCart}
                  disabled={clearCart.isPending}
                  className="w-full sm:w-auto px-4 py-2 border border-red-200 hover:border-red-400 text-red-500 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>

            {/* Right side: Cart Summary */}
            <div className="lg:col-span-4 space-y-6">

              {/* Order Summary box */}
              <div className="bg-white border border-brand-200/25 rounded-3xl p-6 shadow-xs space-y-6">
                <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest pb-3 border-b border-brand-100">
                  Tóm tắt đơn hàng
                </h3>

                {/* Selected count indicator */}
                <div className="flex items-center justify-between text-[10px] text-brand-500 font-light bg-brand-50/60 rounded-xl px-3 py-2.5 border border-brand-100/60">
                  <span>Sản phẩm đã chọn</span>
                  <span className="font-bold text-brand-800">
                    {selectedIds.size} / {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-brand-600 font-light">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-brand-900">{selectedSubtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-xs text-brand-600 font-light">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold text-brand-900">
                      {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                    </span>
                  </div>

                  {shippingFee > 0 && selectedSubtotal > 0 && (
                    <div className="text-[10px] text-brand-500 font-light bg-brand-50/50 p-3 border border-brand-100 rounded-xl leading-normal flex items-start gap-2">
                      <Truck size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>Mua thêm <strong>{(1000000 - selectedSubtotal).toLocaleString('vi-VN')}₫</strong> để được miễn phí vận chuyển.</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-brand-150 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-light text-brand-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-brand-900">
                    {finalTotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                <button
                  disabled={selectedIds.size === 0}
                  onClick={() => {
                    toast.success('Hệ thống đặt hàng đang được liên kết. Cảm ơn bạn đã trải nghiệm!');
                  }}
                  className="w-full py-4 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Tiến hành thanh toán
                  {selectedIds.size > 0 && (
                    <span className="ml-1 text-[9px] font-semibold bg-white/20 rounded-full px-1.5 py-0.5">
                      {selectedIds.size}
                    </span>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="bg-brand-50/50 border border-brand-200/20 p-5 rounded-2xl space-y-4 text-xs font-light text-brand-600">
                <div className="flex gap-3">
                  <ShieldCheck size={16} className="text-brand-500 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-brand-900 block mb-0.5">Thanh toán bảo mật</strong>
                    Mọi giao dịch đều được mã hóa bảo mật tối đa.
                  </div>
                </div>
                <div className="flex gap-3">
                  <Truck size={16} className="text-brand-500 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-brand-900 block mb-0.5">Giao hàng nhanh chóng</strong>
                    Nhận hàng từ 2 - 4 ngày làm việc trên toàn quốc.
                  </div>
                </div>
                <div className="flex gap-3">
                  <RefreshCw size={16} className="text-brand-500 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-brand-900 block mb-0.5">Đổi trả dễ dàng</strong>
                    Đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng.
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
