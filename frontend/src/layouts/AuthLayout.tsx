import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 font-sans bg-brand-50">

      {/* Left: Premium Brand Banner (desktop only) */}
      <div className="hidden lg:block lg:col-span-5 relative overflow-hidden bg-brand-200">
        <img
          src="/auth_banner.png"
          alt="Seoul Blanc Premium Fashion"
          className="absolute inset-0 w-full h-full object-cover brightness-95 contrast-100 transition-all duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent flex flex-col justify-end p-12 text-white">
          <span className="text-xs uppercase tracking-[0.3em] font-light mb-2 text-brand-200/80">
            SEOUL BLANC
          </span>
          <h2 className="text-2xl font-light tracking-widest uppercase mb-4 leading-snug">
            Korean Art of Styling
          </h2>
          <p className="text-xs font-light text-brand-200/70 max-w-sm leading-relaxed">
            Thiết kế thời trang phong cách tối giản Hàn Quốc, mang đến cho bạn sự sang trọng, thanh lịch trong từng chi tiết.
          </p>
        </div>
      </div>

      {/* Right: Auth Form Content */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 md:p-16 relative">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Page content rendered here */}
        <div className="w-full max-w-[440px] relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
