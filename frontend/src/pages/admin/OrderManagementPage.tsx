import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Calendar, User, MapPin, MessageSquare, 
  Filter, Info 
} from 'lucide-react';
import { useOrder } from '../../features/order/hooks/useOrder.js';
import type { Order, OrderStatus } from '../../features/order/types/index.js';

export const OrderManagementPage: React.FC = () => {
  const { useAdminGetOrders, updateStatus, handleReturnRequest } = useOrder();
  const { data: response, isLoading } = useAdminGetOrders();
  const orders = response?.data?.orders || [];

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : statusFilter === 'RETURN_PENDING'
    ? orders.filter((o) => o.returnStatus === 'PENDING')
    : orders.filter((o) => o.orderStatus === statusFilter);

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate(
      { orderId, status },
      {
        onSuccess: (res: { data: { order: Order } }) => {
          // Update selected order in state if it's currently open
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(res.data.order);
          }
        },
      }
    );
  };

  const handleReturnRequestAction = (orderId: string, action: 'APPROVE' | 'REJECT') => {
    handleReturnRequest.mutate(
      { orderId, action },
      {
        onSuccess: (res: { data: { order: Order } }) => {
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(res.data.order);
          }
        },
      }
    );
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium text-[10px] border border-amber-200/50">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium text-[10px] border border-blue-200/50">Đã xác nhận</span>;
      case 'SHIPPING':
        return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium text-[10px] border border-indigo-200/50">Đang giao hàng</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium text-[10px] border border-emerald-200/50">Đã giao</span>;
      case 'RETURNED':
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium text-[10px] border border-purple-200/50">Trả hàng/Hoàn tiền</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium text-[10px] border border-red-200/50">Đã hủy</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[9px] border border-gray-200">Chưa thanh toán</span>;
      case 'PAID':
        return <span className="px-2 py-0.5 bg-emerald-50/80 text-emerald-600 rounded text-[9px] border border-emerald-200">Đã thanh toán</span>;
      case 'REFUNDED':
        return <span className="px-2 py-0.5 bg-purple-50/80 text-purple-600 rounded text-[9px] border border-purple-200">Đã hoàn tiền</span>;
      default:
        return <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[9px] border border-red-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-brand-100">
        <div>
          <h1 className="text-xl font-light text-brand-900 tracking-wide">Quản lý Đơn hàng</h1>
          <p className="text-xs text-brand-500 font-light mt-1">Cập nhật và theo dõi các đơn hàng trên toàn hệ thống</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 bg-white border border-brand-200 rounded-xl px-3 py-2 shadow-xs">
          <Filter size={14} className="text-brand-400" />
          <span className="text-[11px] text-brand-500 font-light mr-1">Bộ lọc:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-transparent font-medium text-brand-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả đơn hàng</option>
            <option value="RETURN_PENDING">⚠️ Cần duyệt hoàn tiền</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="DELIVERED">Đã giao thành công</option>
            <option value="RETURNED">Đã trả hàng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders List Table (Full Width) */}
      <div className="bg-white border border-brand-200/50 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs font-light text-brand-500">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Package size={36} className="mx-auto text-brand-300" />
            <p className="text-xs text-brand-550 font-light">Không tìm thấy đơn hàng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-50/40 text-[10px] text-brand-500 font-semibold uppercase tracking-wider border-b border-brand-100">
                  <th className="px-6 py-4">Mã Đơn hàng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Ngày Đặt</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 text-xs">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-brand-50/10 transition-colors cursor-pointer ${
                      selectedOrder?.id === order.id 
                        ? 'bg-brand-50/30' 
                        : order.returnStatus === 'PENDING'
                        ? 'bg-amber-50/40 border-l-2 border-l-amber-500'
                        : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 font-semibold text-brand-950">{order.orderCode}</td>
                    <td className="px-6 py-4 min-w-[120px]">
                      <div className="font-medium text-brand-800">{order.user?.fullName}</div>
                      <div className="text-[10px] text-brand-500 font-light">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-600 font-light">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-900">
                      {order.totalPrice.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getStatusBadge(order.orderStatus)}
                        {order.returnStatus === 'PENDING' && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[8px] tracking-wide animate-pulse uppercase">
                            Cần duyệt
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">{getPaymentStatusBadge(order.paymentStatus)}</div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 hover:bg-brand-100 rounded-lg text-brand-600 hover:text-brand-900 transition-colors"
                      >
                        <Info size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-205"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white border border-brand-200/50 rounded-3xl p-6 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex justify-between items-start pb-4 border-b border-brand-100">
              <div>
                <h3 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
                  Chi tiết Đơn hàng
                </h3>
                <p className="text-[10px] text-brand-500 font-semibold mt-1">{selectedOrder.orderCode}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-brand-500 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Đóng
              </button>
            </div>

            {/* Status Update Control */}
            <div className="bg-brand-50/40 p-4 border border-brand-100 rounded-2xl space-y-3">
              <label className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                Cập nhật trạng thái
              </label>
              
              <div className="flex gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  disabled={updateStatus.isPending}
                  className="flex-1 bg-white border border-brand-250 rounded-xl px-3 py-2 text-xs text-brand-800 focus:outline-none focus:border-brand-600 cursor-pointer"
                >
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="DELIVERED">Đã giao thành công</option>
                  <option value="RETURNED">Đã trả hàng hoàn tiền</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Return Request Control */}
            {selectedOrder.returnStatus === 'PENDING' && (
              <div className="bg-amber-50/70 p-4 border border-amber-200 rounded-2xl space-y-3">
                <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Yêu cầu trả hàng hoàn tiền
                </label>
                <div className="text-xs text-brand-800">
                  <p className="font-light">
                    <strong className="font-semibold text-brand-950">Lý do khách hàng đưa ra:</strong>
                  </p>
                  <p className="mt-1 bg-white/70 p-2.5 rounded-lg border border-amber-200/50 italic text-brand-600">
                    "{selectedOrder.returnReason || 'Không có lý do cụ thể'}"
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleReturnRequestAction(selectedOrder.id, 'APPROVE')}
                    disabled={handleReturnRequest.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleReturnRequestAction(selectedOrder.id, 'REJECT')}
                    disabled={handleReturnRequest.isPending}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-xl py-2 text-xs font-medium transition-colors cursor-pointer text-center"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {/* Display Return Status feedback if approved or rejected */}
            {selectedOrder.returnStatus && selectedOrder.returnStatus !== 'PENDING' && (
              <div className="bg-brand-50 p-3.5 border border-brand-200 rounded-2xl text-xs text-brand-700">
                <span className="font-semibold block text-[10px] uppercase tracking-wider text-brand-400">
                  Kết quả yêu cầu trả hàng
                </span>
                <p className="mt-1">
                  Trạng thái:{' '}
                  <strong className={selectedOrder.returnStatus === 'APPROVED' ? 'text-emerald-600 font-semibold' : 'text-red-550 font-semibold'}>
                    {selectedOrder.returnStatus === 'APPROVED' ? 'Đã chấp nhận hoàn tiền' : 'Đã từ chối hoàn tiền'}
                  </strong>
                </p>
                {selectedOrder.returnReason && (
                  <p className="mt-1 text-[11px] text-brand-500">Lý do khách gửi: {selectedOrder.returnReason}</p>
                )}
              </div>
            )}

            {/* Order Items Info */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">Sản phẩm</h4>
              <div className="space-y-3 divide-y divide-brand-100 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items.map((item, idx) => {
                  const itemContent = (
                    <>
                      <img
                        src={item.thumbnail || '/placeholder.jpg'}
                        alt={item.productName}
                        className="w-10 h-12 rounded object-cover border border-brand-100"
                      />
                      <div className="flex-1 min-w-0 text-xs font-light text-left">
                        <h5 className="text-brand-950 truncate font-normal group-hover:text-brand-700 transition-colors">
                          {item.productName}
                        </h5>
                        <p className="text-[10px] text-brand-500">
                          Màu: {item.color} | Size: {item.size} | SL: {item.quantity}
                        </p>
                      </div>
                      <div className="text-xs font-medium text-brand-900">
                        {item.price.toLocaleString('vi-VN')}₫
                      </div>
                    </>
                  );

                  return item.productId ? (
                    <Link
                      key={idx}
                      to={`/products/${item.productId}`}
                      className="flex gap-3 items-center pt-3 first:pt-0 group cursor-pointer hover:bg-brand-50/20 p-1.5 rounded-xl transition-all"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div key={idx} className="flex gap-3 items-center pt-3 first:pt-0 p-1.5">
                      {itemContent}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost brief */}
            <div className="border-t border-brand-100 pt-4 space-y-2 text-xs font-light text-brand-700">
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-brand-950">
                  {selectedOrder.shippingFee === 0 ? 'Miễn phí' : `${selectedOrder.shippingFee.toLocaleString('vi-VN')}₫`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-normal text-brand-950 border-t border-brand-100/60 pt-2">
                <span>Tổng tiền</span>
                <span className="font-bold text-brand-950">
                  {selectedOrder.totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-4 pt-4 border-t border-brand-100 text-xs font-light text-brand-700">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">Thông tin giao nhận</h4>
                
                <div className="flex gap-2 items-start">
                  <User size={13} className="text-brand-400 mt-0.5" />
                  <span>
                    <strong className="font-normal text-brand-900">Khách hàng:</strong>{' '}
                    {selectedOrder.user?.fullName}
                  </span>
                </div>

                <div className="flex gap-2 items-start">
                  <MapPin size={13} className="text-brand-400 mt-0.5" />
                  <span>
                    <strong className="font-normal text-brand-900">Địa chỉ:</strong>{' '}
                    {selectedOrder.shippingAddress}
                  </span>
                </div>

                {selectedOrder.note && (
                  <div className="flex gap-2 items-start">
                    <MessageSquare size={13} className="text-brand-400 mt-0.5" />
                    <span>
                      <strong className="font-normal text-brand-900">Ghi chú:</strong> {selectedOrder.note}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 items-start">
                  <Calendar size={13} className="text-brand-400 mt-0.5" />
                  <span>
                    <strong className="font-normal text-brand-900">Thời gian tạo:</strong>{' '}
                    {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
