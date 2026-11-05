import React, { useState, useMemo } from 'react';
import { Package, Clock, CheckCircle2, Truck, CheckCheck, RotateCcw, XCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../features/order/hooks/useOrder.js';
import { useReview } from '../../features/review/hooks/useReview.js';
import {
  OrderCard,
  OrderRefundModal,
  OrderReviewModal,
} from '../../features/order/components/index.js';
import type { Order } from '../../features/order/types/index.js';

type OrderTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'RETURN' | 'CANCELLED';

interface TabConfig {
  id: OrderTab;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const TABS: TabConfig[] = [
  { id: 'ALL', label: 'Tất cả', icon: Package },
  { id: 'PENDING', label: 'Chờ xác nhận', icon: Clock },
  { id: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
  { id: 'SHIPPING', label: 'Đang giao', icon: Truck },
  { id: 'DELIVERED', label: 'Đã giao', icon: CheckCheck },
  { id: 'RETURN', label: 'Trả hàng / Hoàn tiền', icon: RotateCcw },
  { id: 'CANCELLED', label: 'Đã hủy', icon: XCircle },
];

export const OrdersPage: React.FC = () => {
  const { useGetOrders, cancelOrder, refundOrder } = useOrder();
  const { createReview } = useReview();
  const { data: response, isLoading } = useGetOrders();
  const orders = response?.data?.orders || [];

  const [activeTab, setActiveTab] = useState<OrderTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for refund reason
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<{ id: string; code: string; totalPrice?: number } | null>(null);
  const [reasonText, setReasonText] = useState('');

  // Review modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Counts for each tab
  const tabCounts = useMemo(() => {
    const counts: Record<OrderTab, number> = {
      ALL: orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      RETURN: 0,
      CANCELLED: 0,
    };

    orders.forEach((order: Order) => {
      if (order.orderStatus === 'PENDING') counts.PENDING += 1;
      else if (order.orderStatus === 'CONFIRMED') counts.CONFIRMED += 1;
      else if (order.orderStatus === 'SHIPPING') counts.SHIPPING += 1;
      else if (order.orderStatus === 'CANCELLED') counts.CANCELLED += 1;
      else if (order.orderStatus === 'RETURNED' || order.returnStatus) counts.RETURN += 1;
      else if (order.orderStatus === 'DELIVERED') counts.DELIVERED += 1;
    });

    return counts;
  }, [orders]);

  // Filter orders by active tab and search query
  const filteredOrders = useMemo(() => {
    let list = orders;

    // Filter by tab
    if (activeTab === 'PENDING') {
      list = list.filter((o: Order) => o.orderStatus === 'PENDING');
    } else if (activeTab === 'CONFIRMED') {
      list = list.filter((o: Order) => o.orderStatus === 'CONFIRMED');
    } else if (activeTab === 'SHIPPING') {
      list = list.filter((o: Order) => o.orderStatus === 'SHIPPING');
    } else if (activeTab === 'DELIVERED') {
      list = list.filter((o: Order) => o.orderStatus === 'DELIVERED' && !o.returnStatus);
    } else if (activeTab === 'RETURN') {
      list = list.filter((o: Order) => o.orderStatus === 'RETURNED' || !!o.returnStatus);
    } else if (activeTab === 'CANCELLED') {
      list = list.filter((o: Order) => o.orderStatus === 'CANCELLED');
    }

    // Filter by search query (order code, product name)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((o: Order) => {
        const matchCode = o.orderCode?.toLowerCase().includes(q);
        const matchItem = o.items?.some((i) => i.productName?.toLowerCase().includes(q));
        return matchCode || matchItem;
      });
    }

    return list;
  }, [orders, activeTab, searchQuery]);

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
    const targetOrder = orders.find((o: Order) => o.id === orderId);
    const isPaid = targetOrder?.paymentStatus === 'PAID';
    const message = isPaid
      ? `Đơn hàng #${orderCode} đã được thanh toán. Bạn có chắc chắn muốn hủy đơn hàng? Số tiền ${targetOrder?.totalPrice.toLocaleString('vi-VN')}₫ sẽ được tự động hoàn trả về tài khoản của bạn!`
      : `Bạn có chắc chắn muốn hủy đơn hàng #${orderCode}?`;

    if (window.confirm(message)) {
      cancelOrder.mutate(orderId);
    }
  };

  const handleRefundOrder = (orderId: string, orderCode: string, totalPrice?: number) => {
    setSelectedRefundOrder({ id: orderId, code: orderCode, totalPrice });
    setReasonText('');
    setRefundModalOpen(true);
  };

  const handleRefundSubmit = (bankInfo?: { bankName: string; accountNumber: string; accountName: string }) => {
    if (!selectedRefundOrder) return;
    const trimmed = reasonText.trim();
    if (!trimmed) {
      window.alert('Lý do trả hàng không được để trống!');
      return;
    }
    refundOrder.mutate(
      { orderId: selectedRefundOrder.id, returnReason: trimmed, bankInfo },
      {
        onSuccess: () => {
          setRefundModalOpen(false);
          setSelectedRefundOrder(null);
          setReasonText('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-brand-500 font-light">Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-200/50 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-brand-400 block mb-1">
            Lịch sử giao dịch
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-brand-950 tracking-wide">
            Đơn hàng của tôi
          </h2>
        </div>
        <span className="self-start sm:self-center text-xs font-medium text-brand-700 bg-brand-100/70 border border-brand-200/70 px-4 py-1.5 rounded-full">
          {orders.length} đơn hàng
        </span>
      </div>

      {/* Status Tabs Bar */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white border border-brand-200/50 rounded-2xl p-1.5 shadow-xs overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              {TABS.map((tab) => {
                const count = tabCounts[tab.id];
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-900 text-white shadow-xs font-semibold'
                        : 'text-brand-600 hover:text-brand-950 hover:bg-brand-50/60 font-medium'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-amber-300' : 'text-brand-400'} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-brand-100 text-brand-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn (#SB...) hoặc tên sản phẩm..."
              className="w-full pl-9 pr-12 py-2.5 bg-white border border-brand-200/60 rounded-xl text-xs font-light text-brand-900 placeholder-brand-400 focus:outline-none focus:border-brand-500 transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-400 hover:text-brand-700 cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Orders List / Empty */}
      {orders.length === 0 ? (
        <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-400">
            <Package size={28} />
          </div>
          <h3 className="text-sm font-semibold text-brand-900">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-brand-500 font-light max-w-sm mx-auto leading-relaxed">
            Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào. Hãy tham khảo các bộ sưu tập mới của Seoul Blanc.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex px-5 py-2.5 bg-brand-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-850 transition-all cursor-pointer shadow-xs"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-brand-200/40 rounded-3xl p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-400">
            <Package size={24} />
          </div>
          <h3 className="text-sm font-semibold text-brand-900">
            {searchQuery
              ? `Không tìm thấy đơn hàng nào khớp với "${searchQuery}"`
              : activeTab === 'PENDING'
              ? 'Không có đơn hàng nào đang chờ xác nhận'
              : activeTab === 'CONFIRMED'
              ? 'Không có đơn hàng nào đã xác nhận'
              : activeTab === 'SHIPPING'
              ? 'Không có đơn hàng nào đang được vận chuyển'
              : activeTab === 'DELIVERED'
              ? 'Không có đơn hàng nào đã giao hoàn tất'
              : activeTab === 'RETURN'
              ? 'Không có đơn hàng nào trong danh sách trả hàng / hoàn tiền'
              : activeTab === 'CANCELLED'
              ? 'Không có đơn hàng nào đã bị hủy'
              : 'Không có đơn hàng nào'}
          </h3>
          <p className="text-xs text-brand-500 font-light max-w-sm mx-auto">
            {searchQuery
              ? 'Vui lòng kiểm tra lại từ khóa hoặc xóa tìm kiếm.'
              : 'Các đơn hàng thuộc trạng thái này sẽ xuất hiện tại đây khi phát sinh giao dịch.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 px-4 py-2 bg-brand-100 hover:bg-brand-200 text-brand-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Xem tất cả đơn trong mục này
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: Order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancelOrder={handleCancelOrder}
              onRefundOrder={handleRefundOrder}
              onOpenReviewModal={handleOpenReviewModal}
              isCancelling={cancelOrder.isPending}
            />
          ))}
        </div>
      )}

      {/* Refund Modal */}
      <OrderRefundModal
        isOpen={refundModalOpen}
        orderCode={selectedRefundOrder?.code || ''}
        orderPrice={selectedRefundOrder?.totalPrice}
        reasonText={reasonText}
        onChangeReason={setReasonText}
        onSubmit={handleRefundSubmit}
        onClose={() => setRefundModalOpen(false)}
        isSubmitting={refundOrder.isPending}
      />

      {/* Review Modal */}
      <OrderReviewModal
        isOpen={reviewModalOpen}
        productName={selectedProduct?.name || ''}
        rating={rating}
        comment={comment}
        onChangeRating={setRating}
        onChangeComment={setComment}
        onSubmit={handleReviewSubmit}
        onClose={() => setReviewModalOpen(false)}
        isSubmitting={createReview.isPending}
      />
    </div>
  );
};

export default OrdersPage;
