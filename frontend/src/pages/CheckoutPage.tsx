import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../features/cart/hooks/useCart.js';
import { useAddress } from '../features/address/hooks/useAddress.js';
import { useOrder } from '../features/order/hooks/useOrder.js';
import { useVoucher } from '../features/voucher/hooks/useVoucher.js';
import { useWallet } from '../features/wallet/hooks/useWallet.js';
import { useAuthStore } from '../store/authStore.js';
import {
  CheckoutAddressSection,
  CheckoutPaymentSection,
  CheckoutOrderSummary,
  CheckoutSuccess,
} from '../features/order/components/index.js';
import { useSettings } from '../shared/hooks/useSettings.js';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    selectedVariantIds?: string[];
    directItem?: {
      productVariantId: string;
      quantity: number;
      price: number;
      variant: any;
    };
  } | null;
  const directItem = state?.directItem;
  const selectedVariantIds = state?.selectedVariantIds || [];

  const { useGetCart } = useCart();
  const { useGetAddresses } = useAddress();
  const { createOrder } = useOrder();
  const { verifyVoucher } = useVoucher();

  const { data: cartResponse, isLoading: isCartLoading } = useGetCart();
  const { data: addressResponse, isLoading: isAddressLoading } = useGetAddresses();

  const cart = cartResponse?.data?.cart;
  const items = cart?.items || [];

  // Filter selected items: directItem takes priority (bypasses cart)
  const selectedItems = directItem
    ? [directItem]
    : selectedVariantIds.length > 0
    ? items.filter((item) => selectedVariantIds.includes(item.productVariantId))
    : items;

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'SEPAY' | 'BLANC_PAY'>('COD');
  const [note, setNote] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Voucher state
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);

  const { settings } = useSettings();
  const { useGetWallet } = useWallet();
  const { data: wallet } = useGetWallet();
  const walletBalance = wallet?.balance || 0;
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  // Totals
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee =
    subtotal >= settings.freeShippingThreshold || subtotal === 0
      ? 0
      : settings.standardShippingFee;
  const discount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const walletDeduction = useWalletBalance ? Math.min(walletBalance, grandTotal) : 0;
  const finalPayTotal = Math.max(0, grandTotal - walletDeduction);

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
        },
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

  // Redirect if cart is empty or not loaded properly (skip if direct buy)
  useEffect(() => {
    if (!directItem && !isCartLoading && selectedItems.length === 0 && !orderSuccess) {
      toast.warning('Giỏ hàng trống hoặc chưa chọn sản phẩm để thanh toán!');
      navigate('/cart');
    }
  }, [selectedItems, isCartLoading, navigate, orderSuccess, directItem]);

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
      {
        addressId: selectedAddressId,
        paymentMethod,
        note: note.trim() || undefined,
        voucherCode: appliedVoucher?.code,
        selectedVariantIds: directItem ? undefined : selectedVariantIds.length > 0 ? selectedVariantIds : undefined,
        directItem: directItem
          ? {
              productVariantId: directItem.productVariantId,
              quantity: directItem.quantity,
            }
          : undefined,
        useWalletBalance,
      },
      {
        onSuccess: (response: any) => {
          setOrderSuccess(response.data.order);
        },
      }
    );
  };

  if ((!directItem && isCartLoading) || isAddressLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-light text-brand-650 tracking-wider">Đang chuẩn bị đơn hàng của bạn...</p>
      </div>
    );
  }

  // --- SUCCESS STATE PAGE ---
  if (orderSuccess) {
    return (
      <CheckoutSuccess
        order={orderSuccess}
        onNavigateOrders={() => navigate('/account/orders')}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-light text-brand-600 hover:text-brand-900 transition-colors"
          >
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
            <CheckoutAddressSection
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onAddAddressClick={() => navigate('/account/addresses')}
            />

            {/* 2. Payment Method Block */}
            <CheckoutPaymentSection
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
              walletBalance={walletBalance}
              grandTotal={grandTotal}
            />

            {/* Wallet Balance Usage Card */}
            {walletBalance > 0 && (
              <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Ví hoàn tiền / Số dư tài khoản
                      </h4>
                      <p className="text-xs text-emerald-750 font-semibold mt-0.5">
                        Khả dụng: {walletBalance.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWalletBalance}
                      onChange={(e) => setUseWalletBalance(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                {useWalletBalance && (
                  <p className="text-[11px] text-emerald-800 font-light pt-2 border-t border-emerald-200/60 leading-relaxed">
                    Đã áp dụng trừ <strong className="font-semibold text-emerald-900">{walletDeduction.toLocaleString('vi-VN')}₫</strong> từ số dư ví vào đơn hàng này.
                    {finalPayTotal === 0 && (
                      <span className="block text-emerald-700 font-medium mt-0.5">
                        🎉 Đơn hàng được thanh toán 100% bằng số dư ví, không cần chuyển khoản thêm!
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

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
          <div className="lg:col-span-5">
            <CheckoutOrderSummary
              items={selectedItems}
              voucherCodeInput={voucherCodeInput}
              onChangeVoucherCode={setVoucherCodeInput}
              onApplyVoucher={handleApplyVoucher}
              onRemoveVoucher={() => {
                setAppliedVoucher(null);
                setVoucherCodeInput('');
              }}
              appliedVoucher={appliedVoucher}
              isVerifyingVoucher={verifyVoucher.isPending}
              subtotal={subtotal}
              shippingFee={shippingFee}
              grandTotal={finalPayTotal}
              walletDeduction={walletDeduction}
              freeShippingThreshold={settings.freeShippingThreshold}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={createOrder.isPending}
              hasAddresses={addresses.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
