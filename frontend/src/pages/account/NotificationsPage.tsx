import React from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useOrder } from '../../features/order/hooks/useOrder.js';

export const NotificationsPage: React.FC = () => {
  const { useGetNotifications, markNotificationsRead, deleteAllNotifications, deleteNotification } = useOrder();
  const { data: notifResponse, isLoading } = useGetNotifications();
  const notifications = notifResponse?.data?.notifications || [];

  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-700">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-900">Thông báo hệ thống</h2>
            <p className="text-xs text-brand-500 font-light">Tin nhắn khuyến mãi và thông báo tài khoản</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => markNotificationsRead.mutate()}
              className="px-3 py-1.5 border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Đọc tất cả
            </button>
            <button
              onClick={() => deleteAllNotifications.mutate()}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={13} /> Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-brand-400 font-light">Đang tải thông báo...</div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <span className="text-xs text-brand-400 font-light block italic">Không có thông báo nào.</span>
        </div>
      ) : (
        <div className="divide-y divide-brand-100">
          {notifications.map((notif: any) => (
            <div key={notif.id} className="py-4 flex items-start justify-between gap-4 group">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs ${!notif.isRead ? 'font-bold text-brand-950' : 'font-medium text-brand-700'}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="px-1.5 py-0.5 bg-brand-900 text-white rounded text-[9px] font-semibold">Mới</span>
                  )}
                </div>
                <p className="text-xs text-brand-500 font-light leading-relaxed">{notif.content}</p>
                <span className="text-[10px] text-brand-400 block font-light">
                  {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <button
                onClick={() => deleteNotification.mutate(notif.id)}
                className="p-1.5 text-brand-300 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Xóa thông báo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
