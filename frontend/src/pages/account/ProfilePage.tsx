/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Key, Check, Wallet, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '../../features/profile/hooks/useProfile.js';
import { useAuthStore } from '../../store/authStore.js';
import { useWallet } from '../../features/wallet/hooks/useWallet.js';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { updateProfile, updateAvatar, changePassword, uploadAvatar } = useProfile();
  const { useGetWallet } = useWallet();
  const { data: wallet } = useGetWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    return localStorage.getItem('blanc_pay_hide_balance') === 'true';
  });

  const toggleHideBalance = () => {
    setHideBalance((prev) => {
      const next = !prev;
      localStorage.setItem('blanc_pay_hide_balance', String(next));
      return next;
    });
  };

  // Split fullName on mount or user change
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) {
      return { firstName: parts[0] || '', lastName: '' };
    }
    const firstName = parts[parts.length - 1];
    const lastName = parts.slice(0, -1).join(' ');
    return { firstName, lastName };
  };

  const initialName = user?.fullName ? splitName(user.fullName) : { firstName: '', lastName: '' };

  // Profile Form States
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [gender, setGender] = useState(user?.gender || 'OTHER');

  // Change Password Collapse State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state if user query refreshes
  useEffect(() => {
    if (user) {
      const name = splitName(user.fullName);
      setFirstName(name.firstName);
      setLastName(name.lastName);
      setPhoneNumber(user.phoneNumber || '');
      setGender(user.gender || 'OTHER');
    }
  }, [user]);

  // Handle avatar update (upload file)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (max 5MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp tin hình ảnh hợp lệ.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh đại diện không được vượt quá 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const uploadToastId = toast.loading('Đang tải ảnh đại diện lên...');
    try {
      // 1. Upload to Cloudinary via backend shared upload API
      const uploadRes = await uploadAvatar.mutateAsync(formData);
      const imageUrl = uploadRes.data.url;

      // 2. Save avatar URL to User DB
      await updateAvatar.mutateAsync(imageUrl);
      toast.dismiss(uploadToastId);
    } catch (err: unknown) {
      toast.dismiss(uploadToastId);
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Không thể cập nhật ảnh đại diện');
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?')) {
      try {
        await updateAvatar.mutateAsync(null);
      } catch {
        // Silent error
      }
    }
  };

  // Submit profile details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error('Tên không được để trống.');
      return;
    }

    const fullName = lastName.trim() ? `${lastName.trim()} ${firstName.trim()}` : firstName.trim();

    updateProfile.mutate({
      fullName,
      phoneNumber: phoneNumber.trim() || null,
      gender: gender as 'MALE' | 'FEMALE' | 'OTHER',
    });
  };

  // Submit password change
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu cũ và mới.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Nhập lại mật khẩu mới không khớp.');
      return;
    }

    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordForm(false);
        },
      }
    );
  };

  return (
    <div className="bg-white border border-brand-200/50 rounded-3xl p-6 sm:p-10 shadow-sm luxury-card-glow space-y-8">
      
      {/* Title */}
      <div className="border-b border-brand-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-brand-400 block mb-1">
            Hồ sơ thành viên
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-brand-950 tracking-wide">
            Thông tin tài khoản
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-500 font-light">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Tài khoản chính thức</span>
        </div>
      </div>

      {/* Wallet Balance Card - Haute Couture VIP Card Aesthetic */}
      <div className="luxury-card-dark text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Subtle decorative glow & pattern */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-gold-400/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-gold-400">
                <Wallet size={15} />
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-brand-300">
                Seoul Blanc Pay · Số dư hoàn tiền
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white flex items-center gap-3">
                {hideBalance ? (
                  <span className="tracking-widest">•••••••• <span className="text-xl sm:text-2xl font-light text-brand-300">₫</span></span>
                ) : (
                  <span className="flex items-baseline gap-1">
                    {(wallet?.balance || 0).toLocaleString('vi-VN')}
                    <span className="text-xl sm:text-2xl font-light text-brand-300">₫</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={toggleHideBalance}
                  className="p-1.5 rounded-full hover:bg-white/10 text-brand-300 hover:text-white transition-colors cursor-pointer"
                  title={hideBalance ? 'Hiển thị số dư' : 'Ẩn số dư'}
                >
                  {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-brand-350 font-light max-w-md leading-relaxed">
                Số dư hoàn tiền được tích lũy từ các đơn hàng hủy hoặc đổi trả. Bạn có thể sử dụng trực tiếp để thanh toán ngay cho mọi đơn hàng mới.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 flex-shrink-0">
            <span className="text-[9px] uppercase font-bold tracking-[0.25em] px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-gold-300">
              VIP Member
            </span>
            <span className="font-editorial text-xs italic tracking-widest text-brand-400 hidden sm:block">
              Seoul Blanc Atelier
            </span>
          </div>
        </div>

        {/* Recent Refund Transactions if any */}
        {wallet?.transactions && wallet.transactions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-300">
              <span>Lịch sử hoàn tiền gần nhất</span>
              <span className="text-brand-400 font-normal lowercase">{wallet.transactions.length} giao dịch</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {wallet.transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between text-xs bg-white/5 hover:bg-white/10 transition-colors p-2.5 rounded-xl border border-white/5"
                >
                  <div className="text-[11px] space-y-0.5">
                    <span className="font-medium text-white block">{tx.description}</span>
                    <span className="text-[9px] text-brand-400">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className={`font-bold text-xs ${tx.amount >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {tx.amount >= 0 ? `+${tx.amount.toLocaleString('vi-VN')}₫` : `${tx.amount.toLocaleString('vi-VN')}₫`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="mb-8">
        <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-4">
          Ảnh đại diện
        </label>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar frame */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-brand-50 border border-brand-200/60 flex items-center justify-center group">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="text-brand-300" size={40} />
            )}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              title="Đổi ảnh đại diện"
            >
              <Camera size={18} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-brand-900 hover:bg-brand-850 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Cập nhật ảnh
            </button>
            
            {user?.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={updateAvatar.isPending}
                className="px-4 py-2 border border-brand-200 hover:border-red-200 hover:text-red-500 text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Xóa ảnh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Tên */}
          <div>
            <label htmlFor="firstName" className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-2">
              Tên
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-11 px-4 border border-brand-200 rounded-xl focus:border-brand-500 text-xs font-light text-brand-900 outline-hidden transition-colors"
              placeholder="Nhập tên của bạn"
            />
          </div>

          {/* Họ */}
          <div>
            <label htmlFor="lastName" className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-2">
              Họ
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-11 px-4 border border-brand-200 rounded-xl focus:border-brand-500 text-xs font-light text-brand-900 outline-hidden transition-colors"
              placeholder="Nhập họ của bạn"
            />
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full h-11 px-4 border border-brand-100 bg-brand-50/40 rounded-xl text-xs font-light text-brand-500 outline-hidden cursor-not-allowed"
              title="Địa chỉ Email không thể thay đổi"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-11 px-4 border border-brand-200 rounded-xl focus:border-brand-500 text-xs font-light text-brand-900 outline-hidden transition-colors"
              placeholder="Nhập số điện thoại của bạn"
            />
          </div>

          {/* Giới tính */}
          <div>
            <label htmlFor="gender" className="block text-[10px] font-bold text-brand-800 uppercase tracking-wider mb-2">
              Giới tính
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-11 px-4 border border-brand-200 rounded-xl focus:border-brand-500 text-xs font-light text-brand-900 outline-hidden transition-colors bg-white cursor-pointer"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác / Không tiết lộ</option>
            </select>
          </div>
        </div>

        {/* Change Password Link */}
        <div className="pt-2 border-t border-brand-100">
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="inline-flex items-center gap-2 text-xs font-medium text-brand-650 hover:text-brand-900 transition-colors cursor-pointer"
          >
            <Key size={14} />
            <span>Thay đổi mật khẩu</span>
          </button>
        </div>

        {/* Collapsible Password Change Form */}
        {showPasswordForm && (
          <div className="bg-brand-50/40 border border-brand-200/50 rounded-2xl p-5 space-y-4 animate-fadeIn">
            <h4 className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
              Cập nhật mật khẩu bảo mật
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-brand-500 uppercase tracking-wider mb-1.5">
                  Mật khẩu cũ
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-brand-200 bg-white rounded-xl focus:border-brand-500 text-xs outline-hidden"
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-brand-500 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-brand-200 bg-white rounded-xl focus:border-brand-500 text-xs outline-hidden"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-brand-500 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 border border-brand-200 bg-white rounded-xl focus:border-brand-500 text-xs outline-hidden"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 border border-brand-200 text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={changePassword.isPending}
                className="px-4 py-2 bg-brand-900 hover:bg-brand-850 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-brand-100">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-900 hover:bg-brand-850 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            {updateProfile.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            <span>Lưu thay đổi</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
