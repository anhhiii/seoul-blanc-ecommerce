import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Heart, Settings, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

interface SidebarLink {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const links: SidebarLink[] = [
    { label: 'Tài khoản', to: '/account', icon: <User size={18} strokeWidth={1.5} /> },
    { label: 'Đơn hàng', to: '/orders', icon: <ShoppingBag size={18} strokeWidth={1.5} /> },
    { label: 'Địa chỉ', to: '/addresses', icon: <MapPin size={18} strokeWidth={1.5} /> },
    { label: 'Yêu thích', to: '/wishlist', icon: <Heart size={18} strokeWidth={1.5} /> },
    { label: 'Cài đặt', to: '/settings', icon: <Settings size={18} strokeWidth={1.5} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-200/60 min-h-[calc(100vh-5rem)] p-6 hidden lg:block">
      {/* User Info */}
      {user && (
        <div className="mb-8 pb-6 border-b border-brand-100">
          <div className="w-14 h-14 rounded-full bg-brand-200 flex items-center justify-center text-lg font-semibold text-brand-700 uppercase mb-3">
            {user.fullName.charAt(0)}
          </div>
          <p className="text-sm font-medium text-brand-900 truncate">{user.fullName}</p>
          <p className="text-xs text-brand-500 truncate">{user.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-100 text-brand-900'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-900'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {link.icon}
              {link.label}
            </div>
            <ChevronRight size={14} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
