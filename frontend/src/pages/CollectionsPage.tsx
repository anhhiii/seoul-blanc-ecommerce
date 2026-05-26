import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

// Seoul Blanc curated editorial collections
// Each collection maps to product filter URLs (by type, tag, or category)
const COLLECTIONS = [
  {
    id: 'new-arrivals',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    subtitle: 'Sản phẩm mới về',
    description: 'Những thiết kế vừa cập bến — tươi mới, tinh tế và chờ đợi bạn khám phá.',
    tag: 'Mới nhất',
    href: '/products?type=NEW',
    accent: '#1C1917', // near black
    textLight: true,
    aspectClass: 'col-span-2 row-span-2',
    gradientFrom: 'from-stone-900',
    gradientTo: 'to-stone-700',
    pattern: 'rings-lg',
  },
  {
    id: 'bestsellers',
    slug: 'bestsellers',
    name: 'Best Sellers',
    subtitle: 'Bán chạy nhất',
    description: 'Được yêu thích bởi hàng nghìn khách hàng.',
    tag: 'Phổ biến',
    href: '/products?type=BESTSELLER',
    accent: '#44403C',
    textLight: true,
    gradientFrom: 'from-stone-700',
    gradientTo: 'to-stone-500',
    pattern: 'dots',
  },
  {
    id: 'outlet',
    slug: 'outlet',
    name: 'Outlet',
    subtitle: 'Sale Up To 50%',
    description: 'Ưu đãi có thời hạn — nhanh tay kẻo hết.',
    tag: '🔥 Ưu đãi',
    href: '/products?type=SALE',
    accent: '#C53030',
    textLight: true,
    gradientFrom: 'from-red-900',
    gradientTo: 'to-rose-700',
    pattern: 'stripe',
  },
  {
    id: 'tops',
    slug: 'ao',
    name: 'Áo',
    subtitle: 'Tops Collection',
    description: 'Áo thun, sơ mi, croptop — phong cách mọi hoàn cảnh.',
    tag: 'Áo',
    href: '/products?type=TOPS',
    accent: '#292524',
    textLight: true,
    gradientFrom: 'from-neutral-900',
    gradientTo: 'to-neutral-700',
    pattern: 'rings',
  },
  {
    id: 'bottoms',
    slug: 'quan',
    name: 'Quần',
    subtitle: 'Bottoms Collection',
    description: 'Quần dài, quần jean tôn dáng hoàn hảo.',
    tag: 'Quần',
    href: '/products?type=BOTTOMS',
    accent: '#1C1917',
    textLight: true,
    gradientFrom: 'from-zinc-900',
    gradientTo: 'to-zinc-600',
    pattern: 'dots',
  },
  {
    id: 'dresses',
    slug: 'vay-dam',
    name: 'Váy / Đầm',
    subtitle: 'Dresses Collection',
    description: 'Váy nhẹ nhàng, thanh lịch cho mọi khoảnh khắc.',
    tag: 'Váy / Đầm',
    href: '/products?type=DRESSES',
    accent: '#3D2B1F',
    textLight: true,
    gradientFrom: 'from-amber-950',
    gradientTo: 'to-stone-700',
    pattern: 'rings',
  },
  {
    id: 'outerwear',
    slug: 'ao-khoac',
    name: 'Áo Khoác',
    subtitle: 'Outerwear Collection',
    description: 'Ấm áp, cá tính và không kém phần tinh tế.',
    tag: 'Áo khoác',
    href: '/products?type=OUTERWEAR',
    accent: '#292524',
    textLight: true,
    gradientFrom: 'from-stone-800',
    gradientTo: 'to-neutral-600',
    pattern: 'stripe',
  },
];

// Decorative SVG patterns for cards
const PatternRings: React.FC<{ large?: boolean }> = ({ large }) => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
    viewBox="0 0 200 200"
    fill="none"
    aria-hidden="true"
  >
    {large ? (
      <>
        <circle cx="160" cy="160" r="140" stroke="white" strokeWidth="1" />
        <circle cx="160" cy="160" r="100" stroke="white" strokeWidth="0.8" />
        <circle cx="160" cy="160" r="60" stroke="white" strokeWidth="0.6" />
        <circle cx="40" cy="40" r="50" stroke="white" strokeWidth="0.5" />
      </>
    ) : (
      <>
        <circle cx="170" cy="30" r="80" stroke="white" strokeWidth="0.8" />
        <circle cx="170" cy="30" r="50" stroke="white" strokeWidth="0.5" />
        <circle cx="30" cy="170" r="60" stroke="white" strokeWidth="0.5" />
      </>
    )}
  </svg>
);

const PatternDots: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" aria-hidden="true">
    <defs>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

const PatternStripe: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" aria-hidden="true">
    <defs>
      <pattern id="stripe" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect x="0" y="0" width="6" height="12" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#stripe)" />
  </svg>
);

interface CollectionCardProps {
  col: (typeof COLLECTIONS)[0];
  featured?: boolean;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ col, featured }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={col.href}
      className={`relative overflow-hidden rounded-3xl flex flex-col justify-end cursor-pointer group ${
        featured ? 'min-h-[480px] sm:min-h-[560px]' : 'min-h-[260px] sm:min-h-[320px]'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: col.accent }}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${col.gradientFrom} ${col.gradientTo} opacity-80`}
      />

      {/* Decorative pattern */}
      {col.pattern === 'rings-lg' && <PatternRings large />}
      {col.pattern === 'rings' && <PatternRings />}
      {col.pattern === 'dots' && <PatternDots />}
      {col.pattern === 'stripe' && <PatternStripe />}

      {/* Hover Scale Animation Background */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-out ${
          hovered ? 'scale-105' : 'scale-100'
        }`}
        style={{ backgroundColor: col.accent, opacity: 0.3 }}
      />

      {/* Tag badge */}
      <div className="absolute top-5 left-5 z-10">
        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">
          <Tag size={8} />
          {col.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 p-7 sm:p-8">
        <span className="text-white/50 text-[9px] uppercase tracking-[0.25em] font-bold block mb-1">
          {col.subtitle}
        </span>
        <h3
          className={`text-white font-light tracking-wider uppercase leading-tight mb-3 ${
            featured ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          {col.name}
        </h3>
        <p className="text-white/60 text-xs font-light leading-relaxed mb-5 max-w-xs">
          {col.description}
        </p>
        <div
          className={`inline-flex items-center gap-2 text-white text-[10px] uppercase tracking-widest font-bold border-b border-white/30 pb-0.5 transition-all duration-300 ${
            hovered ? 'gap-3 border-white/70' : ''
          }`}
        >
          Khám phá
          <ArrowRight size={12} className={`transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
        </div>
      </div>
    </Link>
  );
};

export const CollectionsPage: React.FC = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen">

      {/* ===== HERO HEADER ===== */}
      <section className="pt-16 pb-12 max-w-7xl mx-auto px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-400 font-bold block mb-3">
              Seoul Blanc
            </span>
            <h1 className="text-4xl sm:text-6xl font-extralight text-brand-900 tracking-wider uppercase leading-tight">
              Bộ sưu<br />
              <span className="font-semibold">tập</span>
            </h1>
          </div>
          <p className="text-xs text-brand-500 font-light max-w-xs leading-relaxed sm:text-right">
            Mỗi bộ sưu tập là một câu chuyện. Chọn phong cách của bạn và để Seoul Blanc đồng hành.
          </p>
        </div>

        {/* Thin divider */}
        <div className="mt-10 h-px bg-brand-200/50" />
      </section>

      {/* ===== GRID ===== */}
      <section className="max-w-7xl mx-auto px-8 pb-24">

        {/* Featured + 2 Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          {/* Featured Hero Card */}
          <div className="lg:col-span-2 lg:row-span-2">
            <CollectionCard col={COLLECTIONS[0]} featured />
          </div>
          {/* Side cards */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <CollectionCard col={COLLECTIONS[1]} />
            <CollectionCard col={COLLECTIONS[2]} />
          </div>
        </div>

        {/* Bottom 4-card row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {COLLECTIONS.slice(3).map((col) => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      </section>

      {/* ===== EDITORIAL CTA ===== */}
      <section className="border-t border-brand-200/40 bg-brand-900 py-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-300/60 font-bold block mb-2">
              Không tìm thấy phong cách phù hợp?
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-wider uppercase">
              Xem toàn bộ <span className="font-semibold">sản phẩm</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-brand-900 px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-brand-50 transition-all duration-300 group"
          >
            Tất cả sản phẩm
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
