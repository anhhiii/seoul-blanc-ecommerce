import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Sản phẩm', to: '/products' },
    { label: 'Danh mục', to: '/categories' },
    { label: 'Về chúng tôi', to: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-200/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-xl lg:text-2xl font-semibold tracking-[0.2em] text-brand-900 uppercase transition-colors group-hover:text-brand-700">
              SEOUL BLANC
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs uppercase tracking-[0.15em] font-medium text-brand-600 hover:text-brand-900 transition-colors duration-200 relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-brand-900 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <button className="text-brand-600 hover:text-brand-900 transition-colors cursor-pointer">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-brand-600 hover:text-brand-900 transition-colors cursor-pointer"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-900 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 uppercase">
                    {user.fullName.charAt(0)}
                  </div>
                  <ChevronDown size={14} strokeWidth={1.5} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-brand-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-brand-100">
                        <p className="text-sm font-medium text-brand-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-brand-500 truncate">{user.email}</p>
                      </div>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                        >
                          Bảng điều khiển Admin
                        </Link>
                      )}
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                      >
                        Tài khoản của tôi
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                      >
                        Đơn hàng
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={14} strokeWidth={1.5} />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium text-brand-900 border border-brand-300 rounded-lg hover:bg-brand-900 hover:text-white hover:border-brand-900 transition-all duration-300"
              >
                <User size={14} strokeWidth={1.5} />
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-brand-100 animate-in slide-in-from-top-2 duration-200">
          <nav className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm uppercase tracking-widest font-medium text-brand-700 hover:text-brand-900 border-b border-brand-100/60 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex items-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="w-full py-3 text-xs uppercase tracking-widest font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Đăng xuất
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full block text-center py-3 text-xs uppercase tracking-widest font-semibold text-white bg-brand-900 rounded-lg hover:bg-brand-800 transition-colors"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
