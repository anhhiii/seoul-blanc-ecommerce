import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { BadRequestException, UnauthorizedException } from '../exceptions/HttpException.js';
import { UserStatus } from '@prisma/client';
import { MailService } from '../shared/services/mail.service.js';

export class AuthService {
  private mailService = new MailService();

  // Find a user by their unique email address
  public findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  };

  // Find a user by their ID
  public findUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  };

  // Authenticate user credentials according to exact MERN OOP specifications
  public login = async (credentials: { email?: string; password?: string }) => {
    const { email, password } = credentials;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.findUserByEmail(email);

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.emailVerifiedAt) {
      throw new BadRequestException('Email not verified');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('User is not active');
    }

    return user;
  };

  // Handle registration
  public register = async (userData: { fullName: string; email: string; password?: string }) => {
    const { fullName, email, password } = userData;
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save verification code (expires in 5 minutes)
    await prisma.verificationCode.create({
      data: {
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send email (asynchronously, won't block response)
    this.mailService.sendVerificationOtp(email, otp, fullName).catch((err) => {
      console.error('Error sending verification email:', err);
    });

    return user;
  };

  // Handle OTP verification
  public verifyOtp = async (data: { email: string; otp: string }) => {
    const { email, otp } = data;

    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // Find latest verification code
    const record = await prisma.verificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.code !== otp) {
      throw new BadRequestException('Mã OTP không hợp lệ');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    // Clear all verification codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email },
    });

    return updatedUser;
  };

  // Handle forgot password request
  public forgotPassword = async (data: { email: string }) => {
    const { email } = data;

    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trên hệ thống');
    }

    // Generate 6-digit reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save reset code (expires in 5 minutes)
    await prisma.verificationCode.create({
      data: {
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send password reset email
    this.mailService.sendPasswordResetOtp(email, otp, user.fullName).catch((err) => {
      console.error('Error sending password reset email:', err);
    });

    return { message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn' };
  };

  // Handle password reset confirmation
  public resetPassword = async (data: { email: string; otp: string; password?: string }) => {
    const { email, otp, password } = data;
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // Find latest verification code
    const record = await prisma.verificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.code !== otp) {
      throw new BadRequestException('Mã OTP không hợp lệ');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // Clear all verification codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email },
    });

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  };

  // Handle Google OAuth Login
  public googleLogin = async (idToken: string) => {
    if (!idToken) {
      throw new BadRequestException('ID token is required');
    }

    try {
      // Call Google's tokeninfo API to verify the token
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new UnauthorizedException('Mã xác thực Google không hợp lệ hoặc đã hết hạn');
      }

      interface GoogleTokenPayload {
        email: string;
        name: string;
        picture?: string;
        email_verified: boolean;
        aud: string;
      }
      const payload = (await response.json()) as GoogleTokenPayload;
      const { email, name, picture, email_verified } = payload;

      if (!email_verified) {
        throw new BadRequestException('Email Google chưa được xác minh');
      }

      // Check if client ID matches (optional safety check if GOOGLE_CLIENT_ID is configured)
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId && payload.aud !== clientId) {
        throw new UnauthorizedException('Client ID không khớp');
      }

      let user = await this.findUserByEmail(email);

      if (user) {
        // If user already exists, make sure they are active
        if (user.status !== UserStatus.ACTIVE) {
          throw new BadRequestException('Tài khoản đã bị khóa hoặc ngừng hoạt động');
        }
        // Update verification time and avatar if not set
        const updateData: { emailVerifiedAt?: Date; avatar?: string } = {};
        if (!user.emailVerifiedAt) {
          updateData.emailVerifiedAt = new Date();
        }
        if (!user.avatar && picture) {
          updateData.avatar = picture;
        }

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { email },
            data: updateData,
          });
        }
      } else {
        // Create new user since it's their first time logging in with Google
        const randomPassword = Math.random().toString(36).slice(-16);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await prisma.user.create({
          data: {
            fullName: name || 'Google User',
            email,
            password: hashedPassword,
            avatar: picture || null,
            role: 'USER', // Default role
            status: UserStatus.ACTIVE,
            emailVerifiedAt: new Date(),
          },
        });
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Lỗi xác thực qua Google';
      throw new UnauthorizedException(message);
    }
  };

  // Handle logout
  public logout = async (_token: string) => {
    return { message: 'Logged out successfully' };
  };
}
