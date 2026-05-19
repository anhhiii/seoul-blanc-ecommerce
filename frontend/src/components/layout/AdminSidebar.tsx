import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

interface AdminLink {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const links: AdminLink[] = [
    { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
    { label: 'Sản phẩm', to: '/admin/products', icon: <Package size={20} strokeWidth={1.5} /> },
    { label: 'Danh mục', to: '/admin/categories', icon: <FolderTree size={20} strokeWidth={1.5} /> },
    { label: 'Đơn hàng', to: '/admin/orders', icon: <ShoppingCart size={20} strokeWidth={1.5} /> },
    { label: 'Người dùng', to: '/admin/users', icon: <Users size={20} strokeWidth={1.5} /> },
    { label: 'Cài đặt', to: '/admin/settings', icon: <Settings size={20} strokeWidth={1.5} /> },
  ];

  return (
    <aside
      className={`bg-brand-950 text-white min-h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">SEOUL BLANC</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white cursor-pointer"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Admin Info */}
      {user && (
        <div className={`p-4 border-b border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-semibold uppercase flex-shrink-0">
            {user.fullName.charAt(0)}
          </div>
          {!collapsed && (
            <div className="mt-2">
              <p className="text-xs font-medium truncate">{user.fullName}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/8 hover:text-white/90'
              }`
            }
            title={collapsed ? link.label : undefined}
          >
            <span className="flex-shrink-0">{link.icon}</span>
            {!collapsed && (
              <span className="text-xs uppercase tracking-wider font-medium">{link.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:bg-white/8 hover:text-white/80 transition-all duration-200 mb-1 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Về trang chủ' : undefined}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
          {!collapsed && <span className="text-xs uppercase tracking-wider font-medium">Về trang chủ</span>}
        </NavLink>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span className="text-xs uppercase tracking-wider font-medium">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
