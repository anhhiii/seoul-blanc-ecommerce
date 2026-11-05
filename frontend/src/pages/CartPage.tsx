import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../features/cart/hooks/useCart.js';
import { CartItemRow, CartSummary, CartEmptyState } from '../features/cart/components/index.js';
import { useSettings } from '../shared/hooks/useSettings.js';

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
  const { settings } = useSettings();
  const selectedItems = items.filter((i) => selectedIds.has(i.productVariantId));
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee =
    selectedSubtotal >= settings.freeShippingThreshold || selectedSubtotal === 0
      ? 0
      : settings.standardShippingFee;
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
          <CartEmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-brand-200/25 overflow-hidden shadow-xs">
                {/* Header row with Select-All (Desktop) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-brand-50/50 border-b border-brand-100 text-[10px] font-bold text-brand-800 uppercase tracking-wider">
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
                  {items.map((item) => (
                    <CartItemRow
                      key={item.productVariantId}
                      item={item}
                      isSelected={selectedIds.has(item.productVariantId)}
                      onToggleSelect={toggleItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemoveItem={handleRemoveItem}
                      isUpdating={updateCartItem.isPending}
                      isRemoving={removeFromCart.isPending}
                    />
                  ))}
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
            <div className="lg:col-span-4">
              <CartSummary
                selectedCount={selectedIds.size}
                totalItemsCount={items.length}
                subtotal={selectedSubtotal}
                shippingFee={shippingFee}
                finalTotal={finalTotal}
                freeShippingThreshold={settings.freeShippingThreshold}
                onCheckout={() => {
                  navigate('/checkout', { state: { selectedVariantIds: Array.from(selectedIds) } });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
