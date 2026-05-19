import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  brand: string;
}

const categories = [
  {
    name: 'Áo',
    slug: 'tops',
    type: 'TOPS',
    description: 'Áo thun, áo sơ mi, áo polo tối giản',
    emoji: '👔',
  },
  {
    name: 'Quần',
    slug: 'bottoms',
    type: 'BOTTOMS',
    description: 'Quần jeans, quần vải, quần short thanh lịch',
    emoji: '👖',
  },
  {
    name: 'Áo khoác',
    slug: 'outerwear',
    type: 'OUTERWEAR',
    description: 'Blazer, cardigan, áo khoác dạ phong cách',
    emoji: '🧥',
  },
  {
    name: 'Váy & Đầm',
    slug: 'dresses',
    type: 'DRESSES',
    description: 'Váy liền, đầm dự tiệc tinh tế',
    emoji: '👗',
  },
];

const features = [
  { icon: <Truck size={22} strokeWidth={1} />, title: 'MIỄN PHÍ VẬN CHUYỂN', desc: 'Đơn hàng từ 500.000đ' },
  { icon: <Shield size={22} strokeWidth={1} />, title: 'CAM KẾT CHÍNH HÃNG', desc: '100% sản phẩm chất lượng' },
  { icon: <RefreshCw size={22} strokeWidth={1} />, title: 'ĐỔI TRẢ 30 NGÀY', desc: 'Hoàn tiền nếu không hài lòng' },
  { icon: <Headphones size={22} strokeWidth={1} />, title: 'HỖ TRỢ 24/7', desc: 'Tư vấn mọi lúc mọi nơi' },
];

const newArrivals: Product[] = [
  {
    id: 'na-1',
    name: 'Áo babydoll nữ tay ngắn THE C.I.U',
    price: '355.000₫',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
  {
    id: 'na-2',
    name: 'Áo thun baby tee nữ THE C.I.U, áo...',
    price: '275.000₫',
    image: 'https://images.unsplash.com/photo-1554412930-e970a19d451c?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
  {
    id: 'na-3',
    name: 'Áo thun nữ cotton THE C.I.U, áo...',
    price: '395.000₫',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
  {
    id: 'na-4',
    name: 'Quần dài kaki nữ ống cong THE C.I.U',
    price: '475.000₫',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
];

const bestSellers: Product[] = [
  {
    id: 'bs-1',
    name: 'Áo Blazer Hàn Quốc dáng rộng thanh lịch',
    price: '650.000₫',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
    brand: 'SEOUL BLANC',
  },
  {
    id: 'bs-2',
    name: 'Đầm sơ mi dáng suông chất liệu linen thoáng mát',
    price: '520.000₫',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop',
    brand: 'SEOUL BLANC',
  },
  {
    id: 'bs-3',
    name: 'Quần tây ống rộng xếp ly cạp cao tôn dáng',
    price: '420.000₫',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop',
    brand: 'SEOUL BLANC',
  },
  {
    id: 'bs-4',
    name: 'Áo khoác Cardigan dệt kim mỏng nhẹ phong cách',
    price: '480.000₫',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
    brand: 'SEOUL BLANC',
  },
];

const onSale: Product[] = [
  {
    id: 'os-1',
    name: 'Áo croptop cổ vuông basic trẻ trung',
    price: '195.000₫',
    originalPrice: '280.000₫',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
  {
    id: 'os-2',
    name: 'Chân váy chữ A túi hộp năng động',
    price: '245.000₫',
    originalPrice: '350.000₫',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
  {
    id: 'os-3',
    name: 'Áo sơ mi lụa tơ tằm mềm mại thanh lịch',
    price: '390.000₫',
    originalPrice: '550.000₫',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop',
    brand: 'SEOUL BLANC',
  },
  {
    id: 'os-4',
    name: 'Quần short jean cạp cao rách gấu cá tính',
    price: '220.000₫',
    originalPrice: '320.000₫',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
    brand: 'THE C.I.U',
  },
];

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new-arrivals' | 'best-sellers' | 'on-sale'>('new-arrivals');

  const getActiveProducts = () => {
    switch (activeTab) {
      case 'new-arrivals':
        return newArrivals;
      case 'best-sellers':
        return bestSellers;
      case 'on-sale':
        return onSale;
      default:
        return newArrivals;
    }
  };

  return (
    <div className="bg-[#FAF8F5]">
      {/* ========== HERO BANNER (As in Image 1) ========== */}
      <section className="relative h-[80vh] min-h-[550px] overflow-hidden">
        <img
          src="/hero_banner.png"
          alt="Seoul Blanc Collection"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center">
          <div className="max-w-xl text-white">
            <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-white/90 font-light mb-4 border border-white/40 px-3.5 py-1 rounded-md">
              BỘ SƯU TẬP HÈ 2026
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-wide leading-tight mb-6">
              Phong cách <br />
              <span className="font-medium">tối giản Hàn <br className="hidden sm:inline" />Quốc</span>
            </h1>
            <p className="text-base text-white/80 font-light leading-relaxed mb-8 max-w-md">
              Khám phá bộ sưu tập thời trang mới nhất lấy cảm hứng từ đường phố Seoul — nơi sự đơn giản gặp gỡ thanh lịch.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-white text-brand-900 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-brand-100 transition-all duration-300 shadow-md"
              >
                KHÁM PHÁ NGAY
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-7 py-4 border border-white/60 text-white text-xs uppercase tracking-widest font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                XEM DANH MỤC
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES BAR (As in Image 1) ========== */}
      <section className="bg-white border-y border-brand-200/50 py-5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <div className="text-brand-800 flex-shrink-0">{f.icon}</div>
                <div className="text-center sm:text-left">
                  <p className="text-[11px] font-semibold text-brand-900 uppercase tracking-widest">{f.title}</p>
                  <p className="text-[11px] text-brand-500 font-light mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES GRID (Preserved) ========== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-medium">BỘ SƯU TẬP</span>
            <h2 className="text-3xl sm:text-4xl font-light text-brand-900 tracking-wider uppercase mt-3">
              Danh mục <span className="font-semibold">sản phẩm</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className="group bg-white border border-brand-200/50 rounded-2xl p-8 hover:border-brand-400 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-5xl mb-4">{cat.emoji}</div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-brand-500 font-light leading-relaxed mb-4">{cat.description}</p>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-brand-600 group-hover:text-brand-900 transition-colors">
                  Xem thêm
                  <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TABS SECTION (As in Image 2) ========== */}
      <section className="py-20 bg-white border-t border-brand-200/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Tabs header area */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-brand-200/60 pb-4 mb-10 gap-4">
            <div className="flex items-center gap-8 sm:gap-12">
              <button
                onClick={() => setActiveTab('new-arrivals')}
                className={`text-sm sm:text-base uppercase tracking-widest font-semibold pb-4 -mb-[18px] relative transition-colors duration-200 cursor-pointer ${activeTab === 'new-arrivals'
                    ? 'text-brand-900 border-b-2 border-brand-900'
                    : 'text-brand-400 hover:text-brand-600'
                  }`}
              >
                NEW ARRIVALS
              </button>
              <button
                onClick={() => setActiveTab('best-sellers')}
                className={`text-sm sm:text-base uppercase tracking-widest font-semibold pb-4 -mb-[18px] relative transition-colors duration-200 cursor-pointer ${activeTab === 'best-sellers'
                    ? 'text-brand-900 border-b-2 border-brand-900'
                    : 'text-brand-400 hover:text-brand-600'
                  }`}
              >
                BEST SELLERS
              </button>
              <button
                onClick={() => setActiveTab('on-sale')}
                className={`text-sm sm:text-base uppercase tracking-widest font-semibold pb-4 -mb-[18px] relative transition-colors duration-200 cursor-pointer ${activeTab === 'on-sale'
                    ? 'text-brand-900 border-b-2 border-brand-900'
                    : 'text-brand-400 hover:text-brand-600'
                  }`}
              >
                ON SALE
              </button>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-brand-700 hover:text-brand-900 transition-colors group"
            >
              Xem tất cả
              <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid of 4 products */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {getActiveProducts().map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-[#FAF8F5] rounded-2xl overflow-hidden border border-brand-200/50 hover:shadow-md transition-all duration-300 relative"
              >
                {/* Product Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-brand-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded">
                      SALE
                    </span>
                  )}
                  <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-brand-700 hover:text-red-500 transition-colors shadow-sm cursor-pointer">
                    <Heart size={14} />
                  </button>
                </div>

                {/* Product details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-brand-400 font-medium">
                      {product.brand}
                    </span>
                    <h4 className="text-xs sm:text-sm text-brand-850 font-light mt-1 mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                      {product.name}
                    </h4>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-sm font-semibold text-brand-900">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-brand-400 line-through">{product.originalPrice}</span>
                      )}
                    </div>

                    {/* Mua ngay button */}
                    <button className="w-full py-2.5 bg-brand-900 hover:bg-brand-800 text-white text-[11px] uppercase tracking-widest font-semibold rounded-lg transition-colors cursor-pointer">
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA NEWSLETTER ========== */}
      <section className="py-20 bg-brand-900">
        <div className="max-w-2xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-light tracking-widest uppercase mb-4">
            Đăng ký nhận <span className="font-semibold">tin mới</span>
          </h2>
          <p className="text-xs text-white/60 font-light mb-8 max-w-md mx-auto leading-relaxed">
            Nhận thông tin về bộ sưu tập mới, ưu đãi đặc biệt và cảm hứng phong cách hàng tuần trực tiếp vào hộp thư của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors"
            />
            <button className="px-6 py-3.5 bg-white text-brand-900 text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-brand-100 transition-colors cursor-pointer">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
