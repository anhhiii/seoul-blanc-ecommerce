import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { loginSchema } from '../../features/auth/validations/auth.validation.js';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login, isLoggingIn, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
      return;
    }

    login({ email, password });
  };

  return (
    <div className="bg-white/75 backdrop-blur-md border border-brand-200 p-10 rounded-2xl shadow-xl transition-all duration-300">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-[0.25em] text-brand-900 uppercase mb-2">SEOUL BLANC</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-light text-brand-600">Đăng nhập tài khoản</p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 border-l-2 bg-red-50 border-red-400 text-red-700 text-xs font-light rounded">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-medium mb-2 text-brand-700">
            Địa chỉ Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@seoulblanc.com"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400 font-light"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[10px] uppercase tracking-widest font-medium text-brand-700">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest text-brand-500 hover:text-brand-900 transition-colors">
              Quên mật khẩu?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-sm px-4 py-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 focus:border-brand-400 focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-brand-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3.5 text-xs uppercase tracking-widest font-semibold rounded-lg bg-brand-900 hover:bg-brand-800 text-white disabled:bg-brand-400 transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg disabled:cursor-not-allowed"
        >
          {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      {/* Google Login Section */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-full flex items-center justify-center mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-200"></div>
          </div>
          <span className="relative px-3 bg-white text-[10px] uppercase tracking-widest text-brand-500 font-light">
            Hoặc đăng nhập bằng
          </span>
        </div>

        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleLogin(credentialResponse.credential);
              }
            }}
            onError={() => {
              toast.error("Đăng nhập bằng Google thất bại");
            }}
            shape="pill"
            theme="outline"
            size="large"
            width="360px"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center border-t border-brand-100 pt-6">
        <p className="text-xs text-brand-600 font-light">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-brand-900 font-medium hover:underline transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
