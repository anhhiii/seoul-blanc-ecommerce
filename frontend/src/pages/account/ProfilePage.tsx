/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Key, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '../../features/profile/hooks/useProfile.js';
import { useAuthStore } from '../../store/authStore.js';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { updateProfile, updateAvatar, changePassword, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="bg-white border border-brand-200/40 rounded-3xl p-6 sm:p-8 shadow-xs">
      
      {/* Title */}
      <div className="border-b border-brand-100 pb-5 mb-8">
        <h2 className="text-xl font-light text-brand-900 tracking-wide">
          Thông tin tài khoản
        </h2>
        <p className="text-xs text-brand-400 font-light mt-1">
          Xem và cập nhật thông tin cá nhân của bạn
        </p>
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
