/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import authApi from "../api/auth.api.js";
import { useAuthStore } from "../../../store/authStore.js";
import type { LoginRequest, RegisterRequest, SendOtpRequest, VerifyOtpRequest, ForgotPasswordRequest, ResetPasswordRequest } from "../types/index.js";

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);

  /**
   * Hook Đăng nhập
   */
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      console.log(accessToken)

      // Xóa sạch cache cũ để đảm bảo dữ liệu mới hoàn toàn
      queryClient.clear();

      setAuth(user, accessToken);
      navigate("/");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
    },
  });

  /**
   * Hook Đăng ký
   */
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (_, variables) => {
      queryClient.clear();
      navigate(`/verify-otp?email=${variables.email}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    },
  });

  /**
   * Hook Gửi OTP
   */
  const sendOtpMutation = useMutation({
    mutationFn: (data: SendOtpRequest) => authApi.sendOtp(data),
    onSuccess: () => {
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể gửi mã OTP";
      toast.error(message);
    },
  });

  /**
   * Hook Xác thực OTP
   */
  const verifyOtpMutation = useMutation({
    mutationFn: (data: VerifyOtpRequest) => authApi.verifyOtp(data),
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Mã OTP không chính xác";
      toast.error(message);
    },
  });

  /**
   * Hook Gửi lại OTP
   */
  const resendOtpMutation = useMutation({
    mutationFn: (data: { email: string }) => authApi.resendOtp(data),
    onSuccess: () => { },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể gửi lại mã OTP";
      toast.error(message);
    },
  });

  const logout = () => {
    // Xóa sạch cache của React Query khi logout
    queryClient.clear();

    logoutStore();
    navigate("/login");
  };

  /**
   * Hook Quên mật khẩu - gửi OTP về email
   */
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (_, variables) => {
      toast.success("Mã OTP đã được gửi về email của bạn! 📧");
      navigate(`/reset-password?email=${variables.email}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể gửi mã OTP";
      toast.error(message);
    },
  });

  /**
   * Hook Đặt lại mật khẩu
   */
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      navigate("/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể đặt lại mật khẩu";
      toast.error(message);
    },
  });

  /**
   * Hook Đăng nhập Google
   */
  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      queryClient.clear();
      setAuth(user, accessToken);
      navigate("/");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Đăng nhập Google thất bại";
      toast.error(message);
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    googleLogin: googleLoginMutation.mutate,
    isGoogleLoggingIn: googleLoginMutation.isPending,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    sendOtp: sendOtpMutation.mutate,
    isSendingOtp: sendOtpMutation.isPending,
    sendOtpSuccess: sendOtpMutation.isSuccess,

    verifyOtp: verifyOtpMutation.mutate,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpSuccess: verifyOtpMutation.isSuccess,

    resendOtp: (email: string) => resendOtpMutation.mutate({ email }),
    isResendingOtp: resendOtpMutation.isPending,
    resendOtpSuccess: resendOtpMutation.isSuccess,

    forgotPassword: forgotPasswordMutation.mutate,
    isSendingForgotOtp: forgotPasswordMutation.isPending,

    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,

    logout,
  };
};

export default useAuth;
