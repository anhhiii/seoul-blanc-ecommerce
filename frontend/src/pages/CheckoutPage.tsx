import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Truck, ShieldCheck, 
  ArrowLeft, CreditCard, CheckCircle, AlertCircle, PlusCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../features/cart/hooks/useCart.js';
import { useAddress } from '../features/address/hooks/useAddress.js';
import { useOrder } from '../features/order/hooks/useOrder.js';
import { useVoucher } from '../features/voucher/hooks/useVoucher.js';
import { useAuthStore } from '../store/authStore.js';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { selectedVariantIds?: string[] } | null;
  const selectedVariantIds = state?.selectedVariantIds || [];

  const { useGetCart } = useCart();
  const { useGetAddresses } = useAddress();
  const { createOrder } = useOrder();
  const { verifyVoucher } = useVoucher();

  const { data: cartResponse, isLoading: isCartLoading } = useGetCart();
  const { data: addressResponse, isLoading: isAddressLoading } = useGetAddresses();

  const cart = cartResponse?.data?.cart;
  const items = cart?.items || [];
  
  // Filter selected items
  const selectedItems = selectedVariantIds.length > 0 
    ? items.filter((item) => selectedVariantIds.includes(item.productVariantId))
    : items; // Default to all if none selected

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Voucher state
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);

  const handleApplyVoucher = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá!');
      return;
    }
    verifyVoucher.mutate(
      { code, subtotal },
      {
        onSuccess: (res: any) => {
          toast.success(res.message || 'Áp dụng mã giảm giá thành công! 🎟️');
          setAppliedVoucher({
            code,
            discountAmount: res.data?.verification?.discountAmount || 0,
          });
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện áp dụng.';
          toast.error(msg);
        }
      }
    );
  };

  // Address response mapping
  const addresses = addressResponse?.data?.addresses || [];

  // Auto-select default address
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses]);

  // Redirect if cart is empty or not loaded properly
  useEffect(() => {
    if (!isCartLoading && selectedItems.length === 0 && !orderSuccess) {
      toast.warning('Giỏ hàng trống hoặc chưa chọn sản phẩm để thanh toán!');
      navigate('/cart');
    }
  }, [selectedItems, isCartLoading, navigate, orderSuccess]);

  // Totals
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const handlePlaceOrder = () => {
    if (user?.role === 'ADMIN') {
      toast.error('Tài khoản Admin không được phép mua hàng!');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn địa chỉ nhận hàng!');
      return;
    }

    createOrder.mutate(
      { addressId: selectedAddressId, note, voucherCode: appliedVoucher?.code },
      {
        onSuccess: (response: any) => {
          setOrderSuccess(response.data.order);
        },
      }
    );
  };

  if (isCartLoading || isAddressLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-light text-brand-650 tracking-wider">Đang chuẩn bị đơn hàng của bạn...</p>
      </div>
    );
  }

  // --- SUCCESS STATE PAGE ---
  if (orderSuccess) {
    return (
      <div className="min-h-[80vh] bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-brand-200/50 rounded-3xl p-8 md:p-12 text-center shadow-xs space-y-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
            <CheckCircle size={44} />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-light text-brand-900 tracking-wide">Đặt Hàng Thành Công!</h2>
            <p className="text-xs text-brand-550 font-light max-w-md mx-auto leading-relaxed">
              Cảm ơn bạn đã lựa chọn Seoul Blanc. Đơn hàng của bạn đã được tiếp nhận và đang chờ quản trị viên xác nhận.
            </p>
          </div>

          {/* Order Brief Info */}
          <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between border-b border-brand-150 pb-3 text-xs">
              <span className="text-brand-500 font-light">Mã đơn hàng</span>
              <span className="font-semibold text-brand-900">{orderSuccess.orderCode}</span>
            </div>
            <div className="flex justify-between border-b border-brand-150 pb-3 text-xs">
              <span className="text-brand-500 font-light">Tổng cộng thanh toán (COD)</span>
              <span className="font-semibold text-brand-900">{orderSuccess.totalPrice.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="text-xs space-y-1">
              <span className="text-brand-500 font-light block">Địa chỉ nhận hàng</span>
              <span className="text-brand-800 font-light leading-relaxed block">
                {orderSuccess.shippingAddress}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/account/orders')}
              className="px-6 py-4 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Theo dõi đơn hàng
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-4 bg-white hover:bg-brand-50 border border-brand-300 text-brand-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-light text-brand-600 hover:text-brand-900 transition-colors">
            <ArrowLeft size={14} />
            Quay lại giỏ hàng
          </Link>
        </div>

        <h1 className="text-2xl font-light text-brand-900 tracking-wide mb-10">Thanh toán</h1>

        {user?.role === 'ADMIN' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200/50 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>
              <strong>Cảnh báo:</strong> Bạn đang đăng nhập bằng tài khoản Quản trị viên (ADMIN). Tài khoản Quản trị viên không được phép đặt hàng thực tế trên hệ thống.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Checkout Info Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Address Block */}
            <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-100">
                <div className="flex items-center gap-2.5">
                  <MapPin size={18} className="text-brand-900" />
                  <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                    Địa chỉ nhận hàng
                  </h2>
                </div>
                <Link 
                  to="/account/addresses" 
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 hover:text-brand-900 transition-colors"
                >
                  <PlusCircle size={12} />
                  Thêm địa chỉ
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-brand-50/40 border border-dashed border-brand-200 rounded-2xl space-y-3">
                  <AlertCircle className="mx-auto text-brand-400" size={24} />
                  <p className="text-xs text-brand-600 font-light">
                    Bạn chưa có địa chỉ nhận hàng nào lưu trong tài khoản.
                  </p>
                  <button
                    onClick={() => navigate('/account/addresses')}
                    className="px-4 py-2 bg-brand-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-850 cursor-pointer"
                  >
                    Thêm địa chỉ giao hàng
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr: any) => (
                    <label 
                      key={addr.id}
                      className={`block p-4 border rounded-2xl cursor-pointer transition-all ${
                        selectedAddressId === addr.id 
                          ? 'border-brand-900 bg-brand-50/20' 
                          : 'border-brand-200/60 hover:border-brand-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 accent-brand-900"
                        />
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-brand-900">{addr.fullName}</span>
                            <span className="text-brand-500 font-light">|</span>
                            <span className="text-brand-700">{addr.phoneNumber}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-brand-900/10 text-brand-900 px-1.5 py-0.5 rounded font-medium">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-brand-600 font-light leading-relaxed">
                            {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Payment Method Block */}
            <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-brand-100">
                <CreditCard size={18} className="text-brand-900" />
                <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="p-4 border border-brand-900 bg-brand-50/20 rounded-2xl flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-brand-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold">✓</span>
                </div>
                <div className="text-xs space-y-1">
                  <strong className="font-bold text-brand-900 block">Thanh toán khi nhận hàng (COD)</strong>
                  <p className="text-brand-600 font-light leading-relaxed">
                    Nhận hàng, kiểm tra sản phẩm và thanh toán bằng tiền mặt trực tiếp cho shipper. Đây là phương thức thanh toán khả dụng.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Note Block */}
            <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest pb-3 border-b border-brand-100">
                Ghi chú đơn hàng
              </h3>
              <textarea
                placeholder="Lưu ý cụ thể cho đơn hàng này (Ví dụ: giao giờ hành chính, gọi trước khi giao 30 phút...)"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-4 border border-brand-200 rounded-xl text-xs font-light text-brand-800 placeholder-brand-400 focus:outline-none focus:border-brand-600 resize-none bg-brand-50/10"
              />
            </div>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            
            <div className="bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs space-y-6">
              <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest pb-3 border-b border-brand-100">
                Đơn hàng của bạn ({selectedItems.length})
              </h2>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                {selectedItems.map((item) => {
                  const product = item.variant?.product;
                  return (
                    <div key={item.productVariantId} className="flex gap-4 items-center">
                      <div className="w-14 h-16 bg-brand-50 rounded-xl overflow-hidden flex-shrink-0 border border-brand-100">
                        <img 
                          src={product?.thumbnail || item.variant?.product?.thumbnail || '/placeholder.jpg'} 
                          alt={product?.name || 'Sản phẩm'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-light text-brand-900 truncate mb-0.5">
                          {product?.name || 'Seoul Blanc Luxury Apparel'}
                        </h4>
                        <div className="flex flex-wrap gap-x-2 text-[10px] text-brand-500 font-light">
                          <span>Màu: {item.variant?.color}</span>
                          <span>•</span>
                          <span>Size: {item.variant?.size}</span>
                          <span>•</span>
                          <span>SL: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-brand-900 flex-shrink-0 text-right">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Voucher Application Field */}
              <div className="border-t border-brand-100 pt-4 space-y-2">
                <label className="text-[10px] font-bold text-brand-850 uppercase tracking-widest block">
                  Mã giảm giá / Coupon
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="NHẬP MÃ GIẢM GIÁ"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    disabled={!!appliedVoucher || verifyVoucher.isPending}
                    className="flex-1 px-3.5 py-2.5 text-xs uppercase tracking-wider rounded-xl bg-brand-50/20 border border-brand-200 text-brand-900 focus:outline-none focus:border-brand-400 placeholder:text-brand-350 disabled:bg-brand-50 disabled:text-brand-400 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={!!appliedVoucher || verifyVoucher.isPending || !voucherCodeInput.trim()}
                    className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-brand-900 hover:bg-brand-800 disabled:bg-brand-300 text-white rounded-xl transition-all cursor-pointer"
                  >
                    {verifyVoucher.isPending ? '...' : 'Áp dụng'}
                  </button>
                </div>
              </div>

              {/* Cost Calculation */}
              <div className="border-t border-brand-100 pt-4 space-y-3">
                <div className="flex justify-between text-xs text-brand-650 font-light">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-brand-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-xs text-emerald-600 font-light">
                    <span className="flex items-center gap-1.5">
                      <span>Mã giảm giá ({appliedVoucher.code})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherCodeInput('');
                        }}
                        className="text-[10px] text-red-500 underline hover:text-red-700 cursor-pointer font-normal border-none bg-transparent p-0"
                      >
                        Gỡ bỏ
                      </button>
                    </span>
                    <span className="font-semibold">-{(appliedVoucher.discountAmount || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-brand-650 font-light">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-brand-900">
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <div className="text-[10px] text-brand-500 font-light bg-brand-50/50 p-3 border border-brand-100 rounded-xl leading-normal flex items-start gap-2">
                    <Truck size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <span>Đặt thêm <strong>{(1000000 - subtotal).toLocaleString('vi-VN')}₫</strong> để nhận ưu đãi miễn phí vận chuyển.</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t border-brand-150 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-light text-brand-900">Tổng cộng</span>
                <span className="text-xl font-bold text-brand-950">
                  {grandTotal.toLocaleString('vi-VN')}₫
                </span>
              </div>

              {/* Submit Button */}
              <button
                disabled={createOrder.isPending || addresses.length === 0}
                onClick={handlePlaceOrder}
                className="w-full py-4.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {createOrder.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý đơn hàng...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Xác nhận đặt hàng
                  </>
                )}
              </button>
            </div>

            {/* Trust note */}
            <div className="text-[11px] text-brand-500 font-light leading-relaxed text-center max-w-xs mx-auto">
              Bằng việc xác nhận đặt hàng, bạn đồng ý với Điều khoản mua sắm và Chính sách vận chuyển của Seoul Blanc.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
