import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export const VerifyOTPPage: React.FC = () => {
  const location = useLocation();
  const { verifyOtp, isVerifyingOtp, resendOtp, isResendingOtp } = useAuth();

  const getEmail = () => {
    if (location.state?.email) return location.state.email;
    const params = new URLSearchParams(location.search);
    return params.get('email') || '';
  };

  const stateEmail = getEmail();
  const [email, setEmail] = useState(stateEmail);
  const [showEmailInput, setShowEmailInput] = useState(!stateEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) newDigits[i] = pastedData[i];
    setOtpDigits(newDigits);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const otp = otpDigits.join('');
    if (!email) { setErrorMsg('Vui lòng nhập địa chỉ Email'); return; }
    if (otp.length !== 6) { setErrorMsg('Vui lòng nhập đủ 6 chữ số OTP'); return; }
    verifyOtp({ email, otp });
  };

  const handleResend = () => {
    if (!email) { setErrorMsg('Vui lòng điền email trước khi gửi lại'); return; }
    setErrorMsg('');
    resendOtp(email);
    setCountdown(60);
    setOtpDigits(Array(6).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="bg-white/75 backdrop-blur-md border border-brand-200 p-10 rounded-2xl shadow-xl transition-all duration-300">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-[0.25em] text-brand-900 uppercase mb-2">SEOUL BLANC</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-light text-brand-600">Xác thực mã OTP</p>
        <p className="text-xs text-brand-600 mt-3 font-light">
          Mã 6 chữ số đã được gửi tới: <strong className="text-brand-900 font-medium">{email}</strong>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {showEmailInput && (
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@seoulblanc.com"
              className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400 font-light" />
          </div>
        )}

        <div>
          <label className="block text-center text-[10px] uppercase tracking-widest font-medium mb-4 text-brand-700">Nhập mã xác thực</label>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otpDigits.map((digit, i) => (
              <input key={i} type="text"
                ref={(el) => { inputRefs.current[i] = el as HTMLInputElement; }}
                value={digit} onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)} onPaste={i === 0 ? handlePaste : undefined}
                className="w-full h-12 sm:h-14 text-center text-xl font-medium rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300" />
            ))}
          </div>
        </div>

        <button type="submit" disabled={isVerifyingOtp}
          className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold rounded-lg bg-brand-900 hover:bg-brand-800 text-white disabled:bg-brand-400 transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg disabled:cursor-not-allowed">
          {isVerifyingOtp ? 'Đang kiểm tra...' : 'Xác nhận mã OTP'}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-brand-100 pt-6 flex flex-col items-center gap-3">
        <span className="text-xs text-brand-600 font-light">Không nhận được mã?</span>
        <button type="button" onClick={handleResend} disabled={countdown > 0 || isResendingOtp}
          className={`text-xs uppercase tracking-widest font-semibold cursor-pointer ${countdown > 0 ? 'text-brand-400 cursor-not-allowed' : 'text-brand-900 hover:underline'}`}>
          {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
        </button>
        <Link to="/login" className="text-xs text-brand-500 hover:text-brand-900 underline font-light mt-2">Quay lại Đăng nhập</Link>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
