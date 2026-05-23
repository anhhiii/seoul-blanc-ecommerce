import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, ChevronDown, ArrowLeft, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useCategory } from '../../features/category/hooks/useCategory.js';
import { useProduct } from '../../features/product/hooks/useProduct.js';
import { useCart } from '../../features/cart/hooks/useCart.js';
import { useWishlist } from '../../features/wishlist/hooks/useWishlist.js';
import type { Category } from '../../features/category/types/index.js';
import type { Product } from '../../features/product/types/index.js';

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch cart details
  const { useGetCart } = useCart();
  const { data: cartResponse } = useGetCart();
  const cart = cartResponse?.data?.cart;
  // Badge shows number of unique product types, not total quantity
  const cartItemsCount = cart?.items.length || 0;

  // Fetch wishlist details
  const { useGetWishlistIds } = useWishlist();
  const { data: wishlistIdsRes } = useGetWishlistIds();
  const wishlistItemsCount = wishlistIdsRes?.data?.productIds.length || 0;

  // Search Drawer States
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const suggestedKeywords = ['áo thun', 'áo', 'quần', 'váy', 'sơ mi', 'áo khoác'];

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { useGetProducts } = useProduct();

  // Only query when debouncedQuery has length >= 1
  const { data: searchResultsData, isLoading: isSearchLoading } = useGetProducts(
    { search: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length > 0 }
  );

  const searchResults = debouncedQuery.length > 0 ? (searchResultsData?.data?.products || []) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSelectQuery(searchQuery.trim());
    }
  };

  const handleSelectQuery = (query: string) => {
    // Add to recent searches
    const updated = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Redirect to products page
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setSearchDrawerOpen(false);
    setSearchQuery('');
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

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
    <>
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
              <button
                onClick={() => setSearchDrawerOpen(true)}
                className="text-brand-600 hover:text-brand-900 transition-colors cursor-pointer"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => navigate('/account/wishlist')}
                className="relative text-brand-600 hover:text-brand-900 transition-colors cursor-pointer"
                title="Sản phẩm yêu thích"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="relative text-brand-600 hover:text-brand-900 transition-colors cursor-pointer"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-900 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              </button>

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-brand-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 uppercase">
                        {user.fullName.charAt(0)}
                      </div>
                    )}
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
                            to="/admin/products"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                          >
                            Bảng điều khiển Admin
                          </Link>
                        )}
                        <Link
                          to="/account/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                        >
                          Thông tin tài khoản
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                        >
                          Quản lý đơn hàng
                        </Link>
                        <Link
                          to="/account/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                        >
                          Sản phẩm yêu thích
                        </Link>
                        <Link
                          to="/account/addresses"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                        >
                          Quản lý địa chỉ
                        </Link>
                        <Link
                          to="/account/vouchers"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs uppercase tracking-wider text-brand-600 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                        >
                          Ví voucher
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

            {/* Mobile Right Actions */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setSearchDrawerOpen(true)}
                className="text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => navigate('/account/wishlist')}
                className="relative text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
              >
                <Heart size={20} strokeWidth={1.5} />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="relative text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-900 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
              >
                {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
            </div>
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
              <div className="pt-4 flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      to="/account/profile"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center py-3 text-xs uppercase tracking-widest font-semibold text-brand-900 border border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      Thông tin tài khoản
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/products"
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-center py-3 text-xs uppercase tracking-widest font-semibold text-brand-900 border border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
                      >
                        Bảng điều khiển Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { setMobileOpen(false); logout(); }}
                      className="w-full py-3 text-xs uppercase tracking-widest font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full block text-center py-3 text-xs uppercase tracking-widest font-semibold text-white bg-brand-900 rounded-lg hover:bg-brand-850 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ================= SEARCH DRAWER (Right Side) ================= */}
      {searchDrawerOpen && (
        <>
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9999] transition-opacity duration-300"
            onClick={() => setSearchDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white z-[9999] shadow-2xl flex flex-col animate-in slide-in-from-right duration-350">
            {/* Header Section of Drawer */}
            <div className="px-6 pt-6 pb-4 border-b border-brand-100 flex items-center gap-4">
              <button
                onClick={() => setSearchDrawerOpen(false)}
                className="text-brand-600 hover:text-brand-900 transition-colors p-1 cursor-pointer"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>

              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} strokeWidth={1.5} className="text-brand-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm"
                    className="w-full bg-brand-50/50 text-xs pl-10 pr-8 py-2.5 rounded-full border border-brand-200/60 focus:border-brand-500 focus:bg-white outline-none transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-400 hover:text-brand-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Case 1: Search query is empty -> Show recent & suggested */}
              {!searchQuery && (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">Tìm kiếm gần đây</h4>
                        <button
                          onClick={clearAllRecent}
                          className="text-[10px] text-brand-400 hover:text-red-500 transition-colors font-medium cursor-pointer"
                        >
                          Xóa Tất Cả
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {recentSearches.map((item, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => handleSelectQuery(item)}
                              className="text-xs text-brand-600 hover:text-brand-900 hover:font-medium transition-all text-left w-full cursor-pointer py-1"
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Keywords */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">Từ khóa được đề xuất</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestedKeywords.map((kw, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectQuery(kw)}
                          className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100/80 text-brand-700 text-xs rounded-full border border-brand-200/40 hover:border-brand-200 transition-all cursor-pointer font-medium"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Case 2: User is typing -> Show dynamic search results */}
              {searchQuery && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-900">Sản phẩm tìm thấy</h4>
                    {isSearchLoading && (
                      <div className="w-4 h-4 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {!isSearchLoading && searchResults.length === 0 ? (
                    <p className="text-xs text-brand-500 font-light text-center py-6">
                      Không tìm thấy sản phẩm nào phù hợp.
                    </p>
                  ) : (
                    <div className="divide-y divide-brand-100">
                      {searchResults.map((prod: Product) => (
                        <Link
                          key={prod.id}
                          to={`/products/${prod.slug}`}
                          onClick={() => setSearchDrawerOpen(false)}
                          className="flex items-center gap-4 py-3 hover:bg-brand-50/30 rounded-lg transition-colors group"
                        >
                          <img
                            src={prod.thumbnail}
                            alt={prod.name}
                            className="w-12 h-16 object-cover rounded-lg border border-brand-100/50 bg-brand-50 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-light text-brand-900 truncate group-hover:text-brand-600 transition-colors">
                              {prod.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-brand-900">
                                {(prod.discountPrice || prod.price).toLocaleString('vi-VN')}₫
                              </span>
                              {prod.discountPrice && (
                                <span className="text-[10px] text-brand-400 line-through">
                                  {prod.price.toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!isSearchLoading && searchResults.length > 0 && (
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => handleSelectQuery(searchQuery)}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-brand-900 text-brand-900 hover:bg-brand-50 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-xs"
                      >
                        Xem thêm
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
