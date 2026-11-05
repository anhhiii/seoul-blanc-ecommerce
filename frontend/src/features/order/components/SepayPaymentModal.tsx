import React, { useEffect, useState, useRef } from 'react';
import { QrCode, Copy, Check, CheckCircle2, AlertCircle, X, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import orderApi from '../api/order.api.js';
import type { SepayPaymentInfo } from '../types/index.js';

interface SepayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  totalPrice: number;
  createdAt?: string;
  initialSepayInfo?: SepayPaymentInfo | null;
  onPaymentSuccess?: () => void;
  onOrderCancelled?: () => void;
}

export const SepayPaymentModal: React.FC<SepayPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
  totalPrice,
  createdAt,
  initialSepayInfo,
  onPaymentSuccess,
  onOrderCancelled,
}) => {
  const [sepayInfo, setSepayInfo] = useState<SepayPaymentInfo | null>(initialSepayInfo || null);
  const [isPaid, setIsPaid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderCreatedAt, setOrderCreatedAt] = useState<string | undefined>(createdAt);

  // Compute persistent expiration time (10 minutes from order creation)
  const getExpirationTimestamp = (createdTime?: string) => {
    if (createdTime) {
      const orderTime = new Date(createdTime).getTime();
      if (!isNaN(orderTime)) return orderTime + 10 * 60 * 1000;
    }
    const storageKey = `sepay_expire_${orderId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const t = Number(stored);
      if (!isNaN(t)) return t;
    }
    const newExpiresAt = Date.now() + 10 * 60 * 1000;
    localStorage.setItem(storageKey, String(newExpiresAt));
    return newExpiresAt;
  };

  const [countdown, setCountdown] = useState<number>(() => {
    const expiresAt = getExpirationTimestamp(createdAt);
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });

  const timerRef = useRef<any>(null);
  const pollRef = useRef<any>(null);
  const hasCancelledRef = useRef<boolean>(false);

  // Auto cancel order when 10 minutes expire
  const handleExpireAndCancel = async () => {
    if (isPaid || isCancelled || hasCancelledRef.current) return;
    hasCancelledRef.current = true;
    setIsCancelled(true);
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await orderApi.cancelOrder(orderId);
    } catch (e) {
      // Backend auto-cancel may have already handled this
    }
    onOrderCancelled?.();
  };

  // Background Check Payment Status
  const checkPaymentStatus = async () => {
    if (isPaid || isCancelled) return;

    try {
      const res: any = await orderApi.checkSePayPayment(orderId);
      const data = res.data || res;
      if (data?.isPaid) {
        setIsPaid(true);
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        onPaymentSuccess?.();

        // Automatically close modal after 1.2s to smoothly reveal the success page
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (data?.isExpired || data?.order?.orderStatus === 'CANCELLED') {
        setIsCancelled(true);
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        onOrderCancelled?.();
      }
    } catch {
      // Background polling silent catch - do NOT toast errors
    }
  };

  // Load order details if sepayInfo or createdAt not yet provided
  useEffect(() => {
    if (!isOpen) return;

    orderApi
      .getOrderDetails(orderId)
      .then((res: any) => {
        const fetchedOrder = res.data?.order || res.order;
        if (fetchedOrder?.createdAt) {
          setOrderCreatedAt(fetchedOrder.createdAt);
          const exp = new Date(fetchedOrder.createdAt).getTime() + 10 * 60 * 1000;
          const remaining = Math.max(0, Math.floor((exp - Date.now()) / 1000));
          setCountdown(remaining);
          if (remaining <= 0 && fetchedOrder?.paymentStatus !== 'PAID') {
            handleExpireAndCancel();
            return;
          }
        }
        if (fetchedOrder?.orderStatus === 'CANCELLED') {
          setIsCancelled(true);
          onOrderCancelled?.();
        } else if (fetchedOrder?.paymentStatus === 'PAID') {
          setIsPaid(true);
          onPaymentSuccess?.();
          setTimeout(() => {
            onClose();
          }, 1200);
        } else if (fetchedOrder?.sepayPaymentInfo) {
          setSepayInfo(fetchedOrder.sepayPaymentInfo);
        } else {
          // Fallback default format
          const cleanDes = orderCode.replace(/[^a-zA-Z0-9]/g, '');
          const amount = Math.round(totalPrice);
          setSepayInfo({
            bankName: 'MBBank',
            accountNumber: '0943276245',
            accountName: 'SEOUL BLANC',
            amount,
            description: cleanDes,
            qrCodeUrl: `https://qr.sepay.vn/img?bank=MBBank&acc=0943276245&template=compact&amount=${amount}&des=${cleanDes}`,
          });
        }
      })
      .catch((err) => console.error('Fetch order details failed:', err));
  }, [isOpen, orderId, orderCode, totalPrice]);

  // Setup auto-polling every 3 seconds & countdown timer
  useEffect(() => {
    if (!isOpen || isPaid || isCancelled) {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // 1. Initial check immediately
    checkPaymentStatus();

    // 2. Poll every 3 seconds
    pollRef.current = setInterval(checkPaymentStatus, 3000);

    // 3. Countdown timer
    const expiresAt = getExpirationTimestamp(orderCreatedAt);
    const updateRemaining = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        handleExpireAndCancel();
      }
    };

    updateRemaining();
    timerRef.current = setInterval(updateRemaining, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaid, isCancelled, orderId, orderCreatedAt]);

  // Handle Copy to Clipboard
  const handleCopy = (text: string | number, fieldName: string) => {
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-brand-200/50 p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-brand-400 hover:text-brand-900 rounded-full hover:bg-brand-50 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {isPaid ? (
          /* SUCCESS STATE */
          <div className="text-center py-6 space-y-5 animate-scale-up">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 size={44} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-brand-900">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-brand-500 font-light leading-relaxed max-w-sm mx-auto">
                Hệ thống SePay đã tự động xác nhận số tiền cho đơn hàng{' '}
                <strong className="font-semibold text-brand-900">#{orderCode}</strong>.
              </p>
              <p className="text-[11px] text-emerald-600 font-medium animate-pulse pt-2">
                Đang tự động chuyển sang trang xác nhận đơn hàng...
              </p>
            </div>
          </div>
        ) : isCancelled ? (
          /* EXPIRED & CANCELLED STATE */
          <div className="text-center py-6 space-y-5 animate-scale-up">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
              <XCircle size={44} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-red-600">Đã Hết Thời Gian Thanh Toán</h3>
              <p className="text-xs text-brand-600 font-light leading-relaxed max-w-sm mx-auto">
                Đơn hàng <strong className="font-semibold text-brand-900">#{orderCode}</strong> đã tự động hủy do quá hạn thời gian thanh toán (10 phút).
              </p>
              <p className="text-[11px] text-brand-400 font-light">
                Số lượng sản phẩm trong kho đã được hoàn lại. Bạn có thể tiến hành đặt hàng lại bất cứ lúc nào.
              </p>
            </div>
            <div className="pt-3 flex gap-3">
              <button
                onClick={() => {
                  window.location.href = '/cart';
                }}
                className="flex-1 py-3.5 bg-brand-900 hover:bg-brand-850 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Quay lại giỏ hàng
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 border border-brand-200 hover:bg-brand-50 text-brand-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT QR STATE */
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-100/60 border border-brand-200/80 rounded-full text-[10px] uppercase tracking-wider font-semibold text-brand-800">
                <QrCode size={13} /> Thanh toán VietQR qua SePay
              </div>
              <h3 className="font-editorial text-2xl font-normal text-brand-950 tracking-wide">
                Quét Mã QR Để Thanh Toán
              </h3>
              <p className="text-xs text-brand-500 font-light">
                Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ để quét mã
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-brand-200/60 flex flex-col items-center justify-center space-y-3">
              {sepayInfo?.qrCodeUrl ? (
                <div className="bg-white p-3 rounded-xl shadow-xs border border-brand-100 relative group">
                  <img
                    src={sepayInfo.qrCodeUrl}
                    alt="VietQR SePay"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-brand-900/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all pointer-events-none" />
                </div>
              ) : (
                <div className="w-56 h-56 bg-brand-100 rounded-xl flex items-center justify-center animate-pulse">
                  <span className="text-xs text-brand-400">Đang tải mã QR...</span>
                </div>
              )}

              {/* Live Status Indicator */}
              <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                  <span className="text-amber-800 font-semibold">
                    Đang chờ chuyển khoản... (Hết hạn sau {String(minutes).padStart(2, '0')}:
                    {String(seconds).padStart(2, '0')})
                  </span>
                </div>
                <span className="text-[10px] text-brand-400 font-light">
                  Hệ thống tự động nhận diện và cập nhật trạng thái ngay sau khi bạn chuyển tiền
                </span>
              </div>
            </div>

            {/* Bank Details Table */}
            <div className="bg-brand-50/40 rounded-2xl p-4 border border-brand-100 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-brand-500">Ngân hàng:</span>
                <span className="font-bold text-brand-900 uppercase">
                  {sepayInfo?.bankName || 'MBBank'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-500">Chủ tài khoản:</span>
                <span className="font-semibold text-brand-900">
                  {sepayInfo?.accountName || 'SEOUL BLANC'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-500">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-900 tracking-wider">
                    {sepayInfo?.accountNumber || '0943276245'}
                  </span>
                  <button
                    onClick={() => handleCopy(sepayInfo?.accountNumber || '0943276245', 'Số tài khoản')}
                    className="p-1 hover:bg-white rounded transition-colors text-brand-600 cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedField === 'Số tài khoản' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-500">Số tiền:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 text-sm">
                    {(sepayInfo?.amount || totalPrice).toLocaleString('vi-VN')}₫
                  </span>
                  <button
                    onClick={() => handleCopy(sepayInfo?.amount || totalPrice, 'Số tiền')}
                    className="p-1 hover:bg-white rounded transition-colors text-brand-600 cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedField === 'Số tiền' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-brand-150">
                <span className="text-brand-500 font-medium">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-900 bg-white px-2 py-0.5 rounded border border-brand-200">
                    {sepayInfo?.description || orderCode}
                  </span>
                  <button
                    onClick={() => handleCopy(sepayInfo?.description || orderCode, 'Nội dung chuyển khoản')}
                    className="p-1 hover:bg-white rounded transition-colors text-brand-600 cursor-pointer"
                    title="Sao chép"
                  >
                    {copiedField === 'Nội dung chuyển khoản' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-brand-500 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50">
              <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
              <span>Vui lòng giữ nguyên <strong>Nội dung chuyển khoản</strong> để hệ thống tự động xác nhận đơn hàng ngay lập tức.</span>
            </div>

            {/* Bottom Actions: Single Close button, no manual button */}
            <div className="pt-1">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-brand-900 hover:bg-brand-850 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm text-center"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default SepayPaymentModal;
