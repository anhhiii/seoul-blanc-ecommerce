import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export const CartEmptyState: React.FC = () => {
  return (
    <div className="bg-white border border-brand-200/20 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="text-brand-400" size={26} />
      </div>
      <h2 className="text-base font-light text-brand-900 tracking-wide mb-2">Giỏ hàng trống</h2>
      <p className="text-xs text-brand-500 font-light mb-8 leading-relaxed">
        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá bộ sưu tập thời trang của Seoul Blanc và lựa chọn món đồ yêu thích của mình.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm"
      >
        <ArrowLeft size={12} />
        Tiếp tục mua sắm
      </Link>
    </div>
  );
};

