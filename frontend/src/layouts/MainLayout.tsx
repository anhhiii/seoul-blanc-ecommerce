import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.js';
import { ChatWidget } from '../components/common/ChatWidget.js';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-50 font-sans">
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-950 text-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-b border-white/10">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold tracking-[0.2em] text-white uppercase mb-4">SEOUL BLANC</h3>
              <p className="text-xs leading-relaxed text-white/40">
                Thương hiệu thời trang tối giản phong cách Hàn Quốc. Mang đến sự thanh lịch, tinh tế trong từng sản phẩm.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">Cửa hàng</h4>
              <ul className="space-y-2.5">
                {['Sản phẩm mới', 'Bán chạy', 'Khuyến mãi', 'Bộ sưu tập'].map((item) => (
                  <li key={item}>
                    <Link to="/products" className="text-xs text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">Hỗ trợ</h4>
              <ul className="space-y-2.5">
                {['Hướng dẫn mua hàng', 'Chính sách đổi trả', 'Vận chuyển', 'Liên hệ'].map((item) => (
                  <li key={item}>
                    <Link to="/" className="text-xs text-white/40 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60 mb-4">Liên hệ</h4>
              <ul className="space-y-2.5 text-xs text-white/40">
                <li>📧 support@seoulblanc.com</li>
                <li>📞 0123 456 789</li>
                <li>📍 Quận 1, TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-wider text-white/30">
              &copy; {new Date().getFullYear()} Seoul Blanc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider text-white/30">
              <Link to="/" className="hover:text-white/60 transition-colors">Điều khoản</Link>
              <Link to="/" className="hover:text-white/60 transition-colors">Bảo mật</Link>
              <Link to="/" className="hover:text-white/60 transition-colors">Cookie</Link>
            </div>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
};

export default MainLayout;
