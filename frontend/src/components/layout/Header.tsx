import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useCategory } from '../../features/category/hooks/useCategory.js';
import type { Category } from '../../features/category/types/index.js';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch categories for mega menu
  const { useGetCategories } = useCategory();
  const { data } = useGetCategories();
  const categories = data?.data?.categories || [];

  const tops = categories.filter((c: Category) => c.type === 'TOPS');
  const bottoms = categories.filter((c: Category) => c.type === 'BOTTOMS');
  const outerwear = categories.filter((c: Category) => c.type === 'OUTERWEAR');
  const dresses = categories.filter((c: Category) => c.type === 'DRESSES');

  const navLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Sản phẩm', to: '/products' },
    { label: 'Bộ sưu tập', to: '/collections' },
    { label: 'Về chúng tôi', to: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-200/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-xl lg:text-2xl font-semibold tracking-[0.2em] text-brand-900 uppercase transition-colors group-hover:text-brand-700">
              SEOUL BLANC
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center h-full">
            <ul className="flex items-center gap-8 h-full">
              {navLinks.map((link) => {
                const isProductTab = link.label === 'Sản phẩm';

                return (
                  <li key={link.to} className={`h-full flex items-center ${isProductTab ? 'group' : ''}`}>
                    <Link
                      to={link.to}
                      className="text-xs uppercase tracking-[0.15em] font-medium text-brand-600 hover:text-brand-900 transition-colors duration-200 py-4"
                    >
                      {link.label}
                    </Link>

                    {/* Mega Menu Overlay for Sản Phẩm */}
                    {isProductTab && (
                      <div className="absolute top-full left-0 w-full bg-white border-t border-brand-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-5 gap-8">
                          
                          {/* Col 1: Tất cả */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-brand-900 mb-6">
                              <Link to="/products" className="hover:text-brand-600 transition-colors">
                                Tất cả sản phẩm
                              </Link>
                            </h3>
                            <ul className="space-y-3">
                              <li><Link to="/products?type=NEW" className="text-xs text-brand-600 hover:text-brand-900 transition-colors">Sản Phẩm Mới</Link></li>
                              <li><Link to="/products?type=BESTSELLER" className="text-xs text-brand-600 hover:text-brand-900 transition-colors">Bán Chạy Nhất</Link></li>
                              <li><Link to="/products?type=SALE" className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors">OUTLET - Sale Up To 50%</Link></li>
                            </ul>
                          </div>

                          {/* Col 2: Áo */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-brand-900 mb-6">
                              <Link to="/products?type=TOPS" className="hover:text-brand-600 transition-colors">
                                Áo
                              </Link>
                            </h3>
                            <ul className="space-y-3">
                              {tops.slice(0, 8).map((cat: Category) => (
                                <li key={cat.id}>
                                  <Link to={`/products?type=TOPS&category=${cat.id}`} className="text-xs text-brand-600 hover:text-brand-900 transition-colors">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Col 3: Quần */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-brand-900 mb-6">
                              <Link to="/products?type=BOTTOMS" className="hover:text-brand-600 transition-colors">
                                Quần
                              </Link>
                            </h3>
                            <ul className="space-y-3">
                              {bottoms.slice(0, 8).map((cat: Category) => (
                                <li key={cat.id}>
                                  <Link to={`/products?type=BOTTOMS&category=${cat.id}`} className="text-xs text-brand-600 hover:text-brand-900 transition-colors">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Col 4: Áo Khoác */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-brand-900 mb-6">
                              <Link to="/products?type=OUTERWEAR" className="hover:text-brand-600 transition-colors">
                                Áo Khoác
                              </Link>
                            </h3>
                            <ul className="space-y-3">
                              {outerwear.slice(0, 8).map((cat: Category) => (
                                <li key={cat.id}>
                                  <Link to={`/products?type=OUTERWEAR&category=${cat.id}`} className="text-xs text-brand-600 hover:text-brand-900 transition-colors">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Col 5: Váy Đầm */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-brand-900 mb-6">
                              <Link to="/products?type=DRESSES" className="hover:text-brand-600 transition-colors">
                                Váy / Đầm
                              </Link>
                            </h3>
                            <ul className="space-y-3">
                              {dresses.slice(0, 8).map((cat: Category) => (
                                <li key={cat.id}>
                                  <Link to={`/products?type=DRESSES&category=${cat.id}`} className="text-xs text-brand-600 hover:text-brand-900 transition-colors">
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
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
