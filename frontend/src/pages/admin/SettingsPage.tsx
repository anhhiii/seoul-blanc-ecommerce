import React, { useState, useEffect } from 'react';
import { Settings, Save, Store, Mail, Phone, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { useSettings } from '../../shared/hooks/useSettings.js';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const [storeName, setStoreName] = useState('Seoul Blanc');
  const [tagline, setTagline] = useState('Korean Minimalist Fashion Ecommerce');
  const [supportEmail, setSupportEmail] = useState('support@seoulblanc.com');
  const [hotline, setHotline] = useState('1900 8888');
  const [address, setAddress] = useState('Hà Nội & TP. Hồ Chí Minh, Việt Nam');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1000000');
  const [standardShippingFee, setStandardShippingFee] = useState('30000');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || 'Seoul Blanc');
      setTagline(settings.tagline || 'Korean Minimalist Fashion Ecommerce');
      setSupportEmail(settings.supportEmail || 'support@seoulblanc.com');
      setHotline(settings.hotline || '1900 8888');
      setAddress(settings.address || 'Hà Nội & TP. Hồ Chí Minh, Việt Nam');
      setFreeShippingThreshold(String(settings.freeShippingThreshold ?? 1000000));
      setStandardShippingFee(String(settings.standardShippingFee ?? 30000));
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      storeName,
      tagline,
      supportEmail,
      hotline,
      address,
      freeShippingThreshold: Number(freeShippingThreshold) || 0,
      standardShippingFee: Number(standardShippingFee) || 0,
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6 text-left">
      <div>
        <h1 className="text-xl font-semibold text-brand-950 tracking-wider uppercase flex items-center gap-2.5">
          <Settings size={22} className="text-brand-900" />
          Cài đặt hệ thống
        </h1>
        <p className="text-xs text-brand-500 font-light mt-1">
          Quản lý các thông số vận hành, thông tin liên hệ và chính sách giao hàng của Seoul Blanc
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info Card */}
        <div className="bg-white border border-brand-200/50 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-brand-100">
            <Store size={18} className="text-brand-900" />
            <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
              Thông tin thương hiệu & Cửa hàng
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2">
                Tên cửa hàng
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2">
                Khẩu hiệu / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Contact & Support Card */}
        <div className="bg-white border border-brand-200/50 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-brand-100">
            <Mail size={18} className="text-brand-900" />
            <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
              Thông tin liên hệ & Hỗ trợ CSKH
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2 flex items-center gap-1.5">
                <Mail size={12} /> Email chăm sóc khách hàng
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2 flex items-center gap-1.5">
                <Phone size={12} /> Hotline trực tuyến
              </label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2 flex items-center gap-1.5">
                <MapPin size={12} /> Địa chỉ văn phòng / Showroom
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Payment Card */}
        <div className="bg-white border border-brand-200/50 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-brand-100">
            <ShieldCheck size={18} className="text-brand-900" />
            <h2 className="text-xs font-bold text-brand-900 uppercase tracking-widest">
              Chính sách Vận chuyển & Giao hàng
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2">
                Hạn mức miễn phí vận chuyển (₫)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-brand-400 mt-1 block">
                Đơn hàng đạt giá trị này sẽ được miễn 100% phí ship.
              </span>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-2">
                Phí giao hàng tiêu chuẩn (₫)
              </label>
              <input
                type="number"
                value={standardShippingFee}
                onChange={(e) => setStandardShippingFee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-light text-brand-900 focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-brand-400 mt-1 block">
                Phí vận chuyển mặc định cho các đơn hàng chưa đạt hạn mức freeship.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 hover:bg-brand-850 text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {updateSettings.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>{updateSettings.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
