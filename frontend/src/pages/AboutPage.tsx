import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Heart, Leaf, Sparkles } from 'lucide-react';

const BRAND_VALUES = [
  {
    icon: Sparkles,
    title: 'Tối Giản Hàn Quốc',
    desc: 'Mỗi thiết kế là sự giao thoa giữa tinh tế và thực dụng — không dư thừa, không thiếu sót.',
  },
  {
    icon: Leaf,
    title: 'Bền Vững & Có Trách Nhiệm',
    desc: 'Chúng tôi cam kết sử dụng vải liệu chất lượng, sản xuất có chủ đích và hạn chế tác động môi trường.',
  },
  {
    icon: Heart,
    title: 'Dành Cho Mọi Vóc Dáng',
    desc: 'Seoul Blanc tin rằng phong cách là quyền của tất cả mọi người, không phân biệt kích thước hay giới tính.',
  },
  {
    icon: MapPin,
    title: 'Cảm Hứng Từ Seoul',
    desc: 'Từ những con phố Gangnam đến không khí nghệ thuật Hongdae — Seoul truyền cảm hứng cho từng đường may.',
  },
];

const TEAM = [
  { name: 'Minh An', role: 'Creative Director', initials: 'MA' },
  { name: 'Ji-yeon Park', role: 'Head of Design', initials: 'JP' },
  { name: 'Linh Phạm', role: 'Brand Strategist', initials: 'LP' },
  { name: 'Soo-hyun Lee', role: 'Head of Production', initials: 'SL' },
];

const MILESTONES = [
  { year: '2019', label: 'Seoul Blanc ra đời tại TP.HCM với 12 thiết kế đầu tiên.' },
  { year: '2020', label: 'Mở rộng dòng sản phẩm và đạt 10,000 đơn hàng đầu tiên.' },
  { year: '2022', label: 'Ra mắt cửa hàng flagship tại Hà Nội và mở rộng thị trường quốc tế.' },
  { year: '2024', label: 'Khai trương nền tảng thương mại điện tử và phục vụ 50,000+ khách hàng.' },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative h-[72vh] min-h-[520px] bg-brand-950 overflow-hidden flex items-end">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-950 to-black opacity-95" />
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full border border-white/5" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full border border-white/10" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full border border-white/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 pb-20 sm:pb-28">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-300/70 font-bold block mb-4">
            Seoul Blanc — Về chúng tôi
          </span>
          <h1 className="text-5xl sm:text-7xl font-extralight text-white tracking-wider leading-tight mb-6 uppercase">
            Đơn giản<br />
            <span className="font-semibold italic">là đủ.</span>
          </h1>
          <p className="text-sm font-light text-white/60 max-w-md leading-relaxed">
            Seoul Blanc — nơi vẻ đẹp Hàn Quốc gặp gỡ sự tinh tế Việt Nam.
            Chúng tôi tin rằng thời trang tốt nhất là thứ bạn không cần phải suy nghĩ nhiều khi mặc lên người.
          </p>
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-400 font-bold block mb-4">
              Câu chuyện thương hiệu
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-brand-900 tracking-wider uppercase mb-8 leading-snug">
              Sinh ra từ<br /><span className="font-semibold">tình yêu với Seoul</span>
            </h2>
            <div className="space-y-5 text-sm text-brand-600 font-light leading-relaxed">
              <p>
                Seoul Blanc được thành lập năm 2019 bởi những người trẻ Việt Nam yêu thích văn hóa và thời trang
                Hàn Quốc. Cái tên "Blanc" — tiếng Pháp có nghĩa là "trắng" — gợi lên sự thuần khiết, tinh tế và
                khoảng không gian để mỗi người tự biểu đạt bản thân.
              </p>
              <p>
                Chúng tôi không theo đuổi xu hướng nhất thời. Thay vào đó, chúng tôi xây dựng những tủ quần áo
                cốt lõi — những thiết kế có thể đồng hành cùng bạn qua nhiều năm tháng mà vẫn giữ nguyên vẻ
                tinh tế và đương đại.
              </p>
              <p>
                Mỗi bộ quần áo rời khỏi xưởng của chúng tôi đều mang theo lời hứa về chất lượng — từ khâu
                chọn vải, kiểm định màu sắc đến từng đường may hoàn chỉnh.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-10 bg-brand-900 text-white px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-brand-800 transition-all duration-300 group"
            >
              Khám phá bộ sưu tập
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Timeline */}
          <div className="space-y-0 relative pl-8 border-l-2 border-brand-200/60">
            {MILESTONES.map((m, i) => (
              <div key={i} className="relative pb-10 last:pb-0">
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-brand-900 border-4 border-[#FAF8F5] shadow" />
                <span className="text-[10px] text-brand-400 uppercase tracking-[0.2em] font-bold">{m.year}</span>
                <p className="text-sm text-brand-700 font-light mt-1 leading-relaxed pr-4">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DIVIDER ===== */}
      <div className="border-t border-brand-200/50 mx-8" />

      {/* ===== VALUES ===== */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-400 font-bold block mb-3">
            Triết lý của chúng tôi
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-brand-900 tracking-wider uppercase">
            Giá trị cốt lõi
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRAND_VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-brand-200/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-900 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider mb-3">
                  {v.title}
                </h3>
                <p className="text-xs text-brand-500 font-light leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="bg-brand-900 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '50,000+', label: 'Khách hàng tin yêu' },
              { number: '500+', label: 'Thiết kế độc quyền' },
              { number: '5+', label: 'Năm kinh nghiệm' },
              { number: '4.8/5', label: 'Điểm đánh giá trung bình' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-light tracking-wider mb-2">{stat.number}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-brand-300/70 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-400 font-bold block mb-3">
            Những người đứng sau
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-brand-900 tracking-wider uppercase">
            Đội ngũ sáng tạo
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {TEAM.map((member, i) => (
            <div key={i} className="text-center group">
              <div className="w-20 h-20 rounded-full bg-brand-900 flex items-center justify-center mx-auto mb-4 text-white font-semibold text-lg group-hover:scale-105 transition-transform duration-300">
                {member.initials}
              </div>
              <div className="text-sm font-semibold text-brand-900">{member.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-brand-400 font-medium mt-1">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-white border-t border-brand-200/50 py-20">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-brand-900 tracking-wider uppercase mb-4">
            Sẵn sàng<br /><span className="font-semibold">khám phá Seoul Blanc?</span>
          </h2>
          <p className="text-sm text-brand-500 font-light mb-10">
            Hãy để chúng tôi đồng hành cùng bạn trên hành trình xây dựng phong cách riêng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-8 py-3.5 bg-brand-900 text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-brand-800 transition-all duration-300 inline-flex items-center gap-2 group"
            >
              Mua sắm ngay
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/collections"
              className="px-8 py-3.5 border border-brand-900 text-brand-900 text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-brand-50 transition-all duration-300"
            >
              Xem bộ sưu tập
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
