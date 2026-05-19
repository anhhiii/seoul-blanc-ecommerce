import { z } from 'zod';

// Login Validation Schema
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

// Register Validation Schema
export const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Full name is required',
      })
      .min(2, 'Full name must be at least 2 characters long'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

// Verify OTP Validation Schema
export const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    otp: z
      .string({
        required_error: 'OTP is required',
      })
      .length(6, 'OTP must be exactly 6 characters long'),
  }),
});

// Forgot Password Validation Schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
  }),
});

// Reset Password Validation Schema
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    otp: z
      .string({
        required_error: 'OTP is required',
      })
      .length(6, 'OTP must be exactly 6 characters long'),
    password: z
      .string({
        required_error: 'New password is required',
      })
      .min(6, 'New password must be at least 6 characters long'),
  }),
});

// Google Login Validation Schema
export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string({
      required_error: 'ID Token is required',
    }),
  }),
});
