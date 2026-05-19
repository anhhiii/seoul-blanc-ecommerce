/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    SendOtpRequest,
    VerifyOtpRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from "../types/index.js";

export const authApi = {
  /**
   * Đăng nhập người dùng
   */
  login: (data: LoginRequest) =>
    apiClient.post<any, LoginResponse>("/auth/login", data),

  /**
   * Đăng ký tài khoản mới
   */
  register: (data: RegisterRequest) =>
    apiClient.post<any, RegisterResponse>("/auth/register", data),

  /**
   * Gửi mã OTP xác thực email
   */
  sendOtp: (data: SendOtpRequest) =>
    apiClient.post<any, { success: boolean; message: string; data: string }>(
      "/auth/send-otp",
      data,
    ),

  /**
   * Xác thực mã OTP
   */
  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient.post<any, { success: boolean; message: string }>(
      "/auth/verify-otp",
      data,
    ),

  /**
   * Gửi lại mã OTP
   */
  resendOtp: (data: { email: string }) =>
    apiClient.post<any, { success: boolean; message: string }>("/auth/resend-otp", data),

  /**
   * Gửi mã OTP đặt lại mật khẩu
   */
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<any, { success: boolean; message: string }>("/auth/forgot-password", data),

  /**
   * Đặt lại mật khẩu với mã OTP
   */
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<any, { success: boolean; message: string }>("/auth/reset-password", data),

  /**
   * Đăng nhập bằng Google
   */
  googleLogin: (idToken: string) =>
    apiClient.post<any, LoginResponse>("/auth/google-login", { idToken }),
};

export default authApi;
