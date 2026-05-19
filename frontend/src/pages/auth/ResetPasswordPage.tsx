import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const { resetPassword, isResettingPassword } = useAuth();

  const getEmail = () => {
    if (location.state?.email) return location.state.email;
    const params = new URLSearchParams(location.search);
    return params.get('email') || '';
  };

  const stateEmail = getEmail();
  const [email, setEmail] = useState(stateEmail);
  const [showEmailInput, setShowEmailInput] = useState(!stateEmail);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !otp || !password) { setErrorMsg('Vui lòng điền đầy đủ thông tin'); return; }
    if (otp.length !== 6) { setErrorMsg('Mã OTP phải có đúng 6 ký tự'); return; }
    resetPassword({ email, otp, password });
  };

  return (
    <div className="bg-white/75 backdrop-blur-md border border-brand-200 p-10 rounded-2xl shadow-xl transition-all duration-300">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-[0.25em] text-brand-900 uppercase mb-2">SEOUL BLANC</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-light text-brand-600">Đặt lại mật khẩu</p>
        <p className="text-xs text-brand-600 mt-3 font-light">
          Nhập mã OTP và mật khẩu mới cho: <strong className="text-brand-900 font-medium">{email}</strong>
          {!stateEmail && (
            <button type="button" onClick={() => setShowEmailInput(!showEmailInput)} className="block text-[10px] underline text-brand-400 hover:text-brand-900 mx-auto mt-2 cursor-pointer">
              Thay đổi email
            </button>
          )}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 border-l-2 bg-red-50 border-red-400 text-red-700 text-xs font-light rounded">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {showEmailInput && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@seoulblanc.com"
              className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400 font-light" />
          </div>
        )}

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Mã OTP (6 số)</label>
          <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456"
            className="w-full text-center tracking-[0.4em] text-lg px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400 font-medium" />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Mật khẩu mới</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400" />
        </div>

        <button type="submit" disabled={isResettingPassword}
          className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold rounded-lg bg-brand-900 hover:bg-brand-800 text-white disabled:bg-brand-400 transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg disabled:cursor-not-allowed">
          {isResettingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-brand-100 pt-6">
        <Link to="/login" className="text-xs text-brand-500 hover:text-brand-900 underline font-light">Quay lại Đăng nhập</Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
