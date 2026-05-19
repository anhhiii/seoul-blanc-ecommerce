import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  passwordConfirmation: z.string().min(6, 'Vui lòng xác nhận lại mật khẩu'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["passwordConfirmation"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
