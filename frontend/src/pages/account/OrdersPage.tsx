import React, { useState } from 'react';
import { Package, ArrowRight, XCircle, RefreshCcw, MapPin, MessageSquare, Calendar, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../features/order/hooks/useOrder.js';
import { useReview } from '../../features/review/hooks/useReview.js';
import type { Order, OrderStatus, PaymentStatus } from '../../features/order/types/index.js';

export const OrdersPage: React.FC = () => {
  const { useGetOrders, cancelOrder, refundOrder } = useOrder();
  const { createReview } = useReview();
  const { data: response, isLoading } = useGetOrders();
  const orders = response?.data?.orders || [];

  // Modal states for refund reason
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<{ id: string; code: string } | null>(null);
  const [reasonText, setReasonText] = useState('');

  // Review modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleOpenReviewModal = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedProduct) return;
    createReview.mutate(
      {
        productId: selectedProduct.id,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReviewModalOpen(false);
          setSelectedProduct(null);
          setComment('');
        },
      }
    );
  };

  const handleCancelOrder = (orderId: string, orderCode: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderCode}?`)) {
      cancelOrder.mutate(orderId);
    }
  };

  const handleRefundOrder = (orderId: string, orderCode: string) => {
    setSelectedRefundOrder({ id: orderId, code: orderCode });
    setReasonText('');
    setRefundModalOpen(true);
  };

  const handleRefundSubmit = () => {
    if (!selectedRefundOrder) return;
    const trimmed = reasonText.trim();
    if (!trimmed) {
      window.alert("Lý do trả hàng không được để trống!");
      return;
    }
    refundOrder.mutate(
      { orderId: selectedRefundOrder.id, returnReason: trimmed },
      {
        onSuccess: () => {
          setRefundModalOpen(false);
          setSelectedRefundOrder(null);
          setReasonText('');
        }
      }
    );
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full font-medium text-[10px] tracking-wide border border-amber-200/50">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full font-medium text-[10px] tracking-wide border border-blue-200/50">Đã xác nhận</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium text-[10px] tracking-wide border border-indigo-200/50">Đang giao hàng</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium text-[10px] tracking-wide border border-emerald-200/50">Đã giao</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full font-medium text-[10px] tracking-wide border border-purple-200/50">Trả hàng/Hoàn tiền</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-medium text-[10px] tracking-wide border border-red-200/50">Đã hủy</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'UNPAID':
        return <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded font-normal text-[10px] border border-gray-200">Chưa thanh toán</span>;
      case 'PAID':
        return <span className="px-2 py-0.5 bg-emerald-50/60 text-emerald-600 rounded font-normal text-[10px] border border-emerald-200">Đã thanh toán</span>;
      case 'REFUNDED':
        return <span className="px-2 py-0.5 bg-purple-50/60 text-purple-600 rounded font-normal text-[10px] border border-purple-200">Đã hoàn tiền</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 bg-red-50/60 text-red-500 rounded font-normal text-[10px] border border-red-200">Lỗi thanh toán</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-brand-200/40 rounded-3xl min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-light text-brand-500">Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="text-brand-400" size={28} />
        </div>
        <h2 className="text-lg font-light text-brand-900 tracking-wide mb-2">Đơn hàng của bạn</h2>
        <p className="text-xs text-brand-500 font-light mb-8 leading-relaxed max-w-sm mx-auto">
          Bạn chưa thực hiện đơn hàng nào trên Seoul Blanc. Hãy tham khảo các thiết kế mới của chúng tôi.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <span>Mua sắm ngay</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-brand-100">
        <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
          Quản lý đơn hàng ({orders.length})
        </h2>
      </div>

      <div className="space-y-6">
        {orders.map((order: Order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order.id}
              className="bg-white border border-brand-200/45 rounded-3xl shadow-xs overflow-hidden transition-all hover:border-brand-300"
            >
              {/* Card Header */}
              <div className="bg-brand-50/30 px-6 py-4.5 border-b border-brand-100 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-brand-950">{order.orderCode}</span>
                    {getOrderStatusBadge(order.orderStatus)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-500 font-light">
                    <Calendar size={12} />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-brand-500 font-light">Thanh toán:</span>
                  {getPaymentStatusBadge(order.paymentStatus)}
                  <span className="text-xs font-bold text-brand-900">
                    {order.totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                
                {/* Items List */}
                <div className="divide-y divide-brand-100">
                  {order.items.map((item, idx) => {
                    const itemContent = (
                      <>
                        <div className="w-12 h-14 bg-brand-50 rounded-lg overflow-hidden border border-brand-100 flex-shrink-0">
                          <img
                            src={item.thumbnail || '/placeholder.jpg'}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-xs text-left">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-light text-brand-900 truncate group-hover:text-brand-700 transition-colors">{item.productName}</h4>
                            {order.orderStatus === 'DELIVERED' && item.productId && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenReviewModal(item.productId!, item.productName);
                                }}
                                className="px-2 py-0.5 text-[9px] bg-brand-50 border border-brand-200 hover:bg-brand-900 text-brand-700 hover:text-white rounded transition-all cursor-pointer flex-shrink-0 font-medium"
                              >
                                Đánh giá
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2 text-[10px] text-brand-500 font-light mt-0.5">
                            <span>Size: {item.size}</span>
                            <span>Màu: {item.color}</span>
                            <span>SL: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-brand-900 text-right flex-shrink-0">
                          {item.price.toLocaleString('vi-VN')}₫
                        </div>
                      </>
                    );

                    return item.productId ? (
                      <Link
                        key={idx}
                        to={`/products/${item.productId}`}
                        className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 group cursor-pointer hover:bg-brand-50/20 px-2 rounded-xl transition-all"
                      >
                        {itemContent}
                      </Link>
                    ) : (
                      <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 px-2">
                        {itemContent}
                      </div>
                    );
                  })}
                </div>

                {/* Shipping & Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-50/20 p-4 border border-brand-100/60 rounded-2xl text-[11px] font-light text-brand-700">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-start">
                      <MapPin size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-medium text-brand-900">Địa chỉ giao hàng:</strong>{' '}
                        {order.shippingAddress}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 border-t md:border-t-0 md:border-l border-brand-150 pt-2 md:pt-0 md:pl-4">
                    {order.note && (
                      <div className="flex gap-2 items-start">
                        <MessageSquare size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-medium text-brand-900">Ghi chú:</strong> {order.note}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 items-start">
                      <Shield size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-medium text-brand-900">Phương thức:</strong> COD (Thu hộ)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline / Progress bar */}
                {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'RETURNED' && (
                  <div className="pt-2">
                    <div className="flex justify-between text-[9px] font-medium text-brand-400 uppercase tracking-wider mb-2">
                      <span className={order.orderStatus === 'PENDING' ? 'text-amber-500' : 'text-brand-900'}>Chờ xác nhận</span>
                      <span className={order.orderStatus === 'CONFIRMED' ? 'text-blue-500' : order.orderStatus !== 'PENDING' ? 'text-brand-900' : ''}>Đã xác nhận</span>
                      <span className={order.orderStatus === 'SHIPPING' ? 'text-indigo-500' : (order.orderStatus === 'DELIVERED') ? 'text-brand-900' : ''}>Đang giao</span>
                      <span className={order.orderStatus === 'DELIVERED' ? 'text-emerald-500 font-bold' : ''}>Đã giao</span>
                    </div>
                    <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          order.orderStatus === 'PENDING'
                            ? 'w-1/4 bg-amber-500'
                            : order.orderStatus === 'CONFIRMED'
                            ? 'w-2/4 bg-blue-500'
                            : order.orderStatus === 'SHIPPING'
                            ? 'w-3/4 bg-indigo-500'
                            : 'w-full bg-emerald-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer / Actions */}
              {(order.orderStatus === 'PENDING' || order.orderStatus === 'DELIVERED') && (
                <div className="px-6 py-4.5 bg-brand-50/20 border-t border-brand-100 flex items-center justify-between gap-3">
                  <div className="text-[10px] font-light text-brand-500">
                    {order.orderStatus === 'DELIVERED' && order.returnStatus === 'REJECTED' && (
                      <span className="text-red-500">Yêu cầu trả hàng trước đó của bạn đã bị từ chối. Bạn có thể gửi lại yêu cầu mới.</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {order.orderStatus === 'PENDING' && (
                      <button
                        disabled={cancelOrder.isPending}
                        onClick={() => handleCancelOrder(order.id, order.orderCode)}
                        className="px-4 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={12} />
                        Hủy đơn hàng
                      </button>
                    )}

                    {order.orderStatus === 'DELIVERED' && (
                      order.returnStatus === 'PENDING' ? (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200/50 rounded-lg text-[10px] font-semibold tracking-wide uppercase">
                          Đang chờ duyệt hoàn tiền...
                        </span>
                      ) : (
                        <button
                          disabled={refundOrder.isPending}
                          onClick={() => handleRefundOrder(order.id, order.orderCode)}
                          className="px-4 py-2 bg-white hover:bg-purple-50 border border-purple-200 text-purple-600 hover:text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCcw size={12} />
                          Trả hàng / Hoàn tiền
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Yêu cầu Trả hàng / Hoàn tiền */}
      {refundModalOpen && selectedRefundOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => { setRefundModalOpen(false); setSelectedRefundOrder(null); }}
        >
          <div 
            className="bg-white border border-brand-200/50 rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                Yêu cầu Trả hàng / Hoàn tiền
              </h3>
              <p className="text-[10px] text-brand-500 font-semibold mt-1">Đơn hàng: {selectedRefundOrder.code}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                Lý do trả hàng <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="Vui lòng nhập lý do chi tiết (ví dụ: giao sai mẫu, sản phẩm lỗi...)"
                rows={4}
                className="w-full bg-brand-50/20 border border-brand-250 rounded-2xl px-4 py-3 text-xs text-brand-800 placeholder:text-brand-400 focus:outline-none focus:border-brand-650 transition-all font-light"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setRefundModalOpen(false); setSelectedRefundOrder(null); }}
                className="flex-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Hủy
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={refundOrder.isPending}
                className="flex-1 bg-brand-900 hover:bg-brand-950 text-white rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {refundOrder.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đánh giá sản phẩm */}
      {reviewModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => { setReviewModalOpen(false); setSelectedProduct(null); }}
        >
          <div 
            className="bg-white border border-brand-200/50 rounded-3xl p-6 shadow-xl max-w-md w-full space-y-4 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                Đánh giá sản phẩm
              </h3>
              <p className="text-[10px] text-brand-650 font-semibold mt-1 truncate">{selectedProduct.name}</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                Chọn số sao đánh giá <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? "fill-amber-400 text-amber-400" : "text-brand-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                Bình luận / Nhận xét (Tùy chọn)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={3}
                className="w-full bg-brand-50/20 border border-brand-250 rounded-2xl px-4 py-3 text-xs text-brand-800 placeholder:text-brand-400 focus:outline-none focus:border-brand-650 transition-all font-light"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setReviewModalOpen(false); setSelectedProduct(null); }}
                className="flex-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Hủy
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={createReview.isPending}
                className="flex-1 bg-brand-900 hover:bg-brand-950 text-white rounded-xl py-2.5 text-xs font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {createReview.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
