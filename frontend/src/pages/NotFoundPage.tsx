import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] bg-[#FAF8F5] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md w-full space-y-6">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-500 block">
          404 — Trang không tồn tại
        </span>

        <h1 className="text-6xl sm:text-7xl font-extralight text-brand-950 tracking-wider font-serif">
          404
        </h1>

        <div className="w-12 h-0.5 bg-brand-900 mx-auto opacity-30" />

        <p className="text-xs sm:text-sm text-brand-600 font-light leading-relaxed">
          Đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Vui lòng quay lại trang chủ hoặc khám phá các bộ sưu tập mới của Seoul Blanc.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-sm"
          >
            <Home size={14} />
            <span>Trang chủ</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-brand-50 border border-brand-200 text-brand-900 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all"
          >
            <ArrowLeft size={14} />
            <span>Xem sản phẩm</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

