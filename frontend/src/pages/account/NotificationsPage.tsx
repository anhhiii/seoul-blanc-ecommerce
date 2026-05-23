import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="bg-white border border-brand-200/40 rounded-3xl p-8 text-center shadow-xs">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Bell className="text-brand-400" size={28} />
      </div>
      <h2 className="text-lg font-light text-brand-900 tracking-wide mb-2">Thông báo</h2>
      <p className="text-xs text-brand-500 font-light mb-4 leading-relaxed max-w-sm mx-auto">
        Theo dõi các thông tin khuyến mãi mới, tin nhắn hệ thống hoặc cập nhật trạng thái đơn hàng.
      </p>
      <span className="text-[10px] text-brand-400 font-light italic">Chưa có thông báo mới nào</span>
    </div>
  );
};

export default NotificationsPage;
