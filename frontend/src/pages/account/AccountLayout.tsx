import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, Heart, User, MapPin, Ticket, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useAuthStore } from '../../store/authStore.js';

export const AccountLayout: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
      logout();
    }
  };

  const menuItems = [
    {
      to: '/account/orders',
      label: 'Quản lý đơn hàng',
      icon: Package,
    },
    {
      to: '/account/wishlist',
      label: 'Sản phẩm yêu thích',
      icon: Heart,
    },
    {
      to: '/account/profile',
      label: 'Thông tin tài khoản',
      icon: User,
    },
    {
      to: '/account/addresses',
      label: 'Sổ địa chỉ',
      icon: MapPin,
    },
    {
      to: '/account/vouchers',
      label: 'Ví voucher',
      icon: Ticket,
    },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 bg-white border border-brand-200/40 rounded-3xl p-6 shadow-xs">
            {/* User Mini Card */}
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-brand-100">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-50 border border-brand-200/50 flex-shrink-0 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="text-brand-400" size={24} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-brand-900 truncate leading-snug">
                  {user?.fullName || 'Khách hàng'}
                </h3>
                <p className="text-[10px] text-brand-500 font-light truncate mt-0.5">
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                </p>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-light tracking-wide transition-all ${
                        isActive
                          ? 'bg-brand-50/70 text-brand-900 font-medium border border-brand-200/20'
                          : 'text-brand-600 hover:bg-brand-50/30 hover:text-brand-850'
                      }`
                    }
                  >
                    <Icon size={16} className="text-brand-500 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              
              {/* Special Admin Link if user is ADMIN */}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin/products')}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-light tracking-wide text-brand-600 hover:bg-brand-50/30 hover:text-brand-850 cursor-pointer"
                >
                  <MapPin size={16} className="text-brand-500 flex-shrink-0" />
                  <span>Trang quản trị Admin</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-light tracking-wide text-red-500 hover:bg-red-50/30 transition-all cursor-pointer mt-2"
              >
                <LogOut size={16} className="text-red-500 flex-shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
