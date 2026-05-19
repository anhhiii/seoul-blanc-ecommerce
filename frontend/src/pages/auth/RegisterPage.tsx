import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { registerSchema } from '../../features/auth/validations/auth.validation.js';

export const RegisterPage: React.FC = () => {
  const { register, isRegistering } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const result = registerSchema.safeParse({ fullName, email, password, passwordConfirmation });
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
      return;
    }

    register({ fullName, email, password });
  };

  return (
    <div className="bg-white/75 backdrop-blur-md border border-brand-200 p-10 rounded-2xl shadow-xl transition-all duration-300">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-[0.25em] text-brand-900 uppercase mb-2">SEOUL BLANC</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-light text-brand-600">Đăng ký thành viên</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 border-l-2 bg-red-50 border-red-400 text-red-700 text-xs font-light rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400 font-light"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Địa chỉ Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@seoulblanc.com"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400 font-light"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400"
          />
        </div>

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold rounded-lg bg-brand-900 hover:bg-brand-800 text-white disabled:bg-brand-400 transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg disabled:cursor-not-allowed"
        >
          {isRegistering ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-brand-100 pt-6">
        <p className="text-xs text-brand-600 font-light">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-brand-900 font-medium hover:underline transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
