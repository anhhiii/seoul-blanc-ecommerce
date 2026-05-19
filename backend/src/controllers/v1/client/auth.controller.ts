import { Request, Response } from 'express';
import { AuthService } from '../../../services/auth.service.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { generateAccessToken, generateRefreshToken } from '../../../utils/jwt.js';
import { toUserResponseDTO } from '../../../mappers/user.mapper.js';
import { TokenPayload } from '../../../types/auth.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { UnauthorizedException } from '../../../exceptions/index.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Unified registration handler
  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.register(req.body);
    return sendResponse(
      res,
      201,
      'User registered successfully. Please verify your account using the OTP sent to your email.',
      {
        user: toUserResponseDTO(user),
      }
    );
  });

  // Verify OTP handler
  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.verifyOtp(req.body);
    return sendResponse(res, 200, 'Account verified successfully', {
      user: toUserResponseDTO(user),
    });
  });

  // Unified login handler for both client users and administrators
  login = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.login(req.body);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerifyAt: user.emailVerifiedAt,
      status: user.status,
    } as TokenPayload;

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendResponse(res, 200, 'User logged in successfully', {
      user: toUserResponseDTO(user),
      accessToken,
      refreshToken,
    });
  });

  // Forgot password request handler
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.forgotPassword(req.body);
    return sendResponse(res, 200, result.message);
  });

  // Reset password handler
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.resetPassword(req.body);
    return sendResponse(res, 200, result.message);
  });

  // Get current user profile handler
  me = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.authService.findUserById(authReq.user.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return sendResponse(res, 200, 'User profile fetched successfully', {
      user: toUserResponseDTO(user),
    });
  });

  // Google Login handler
  googleLogin = asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const user = await this.authService.googleLogin(idToken);

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerifyAt: user.emailVerifiedAt,
      status: user.status,
    } as TokenPayload;

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendResponse(res, 200, 'Đăng nhập bằng Google thành công', {
      user: toUserResponseDTO(user),
      accessToken,
      refreshToken,
    });
  });

  // Unified logout handler
  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1] || '';
    const result = await this.authService.logout(token);
    return sendResponse(res, 200, result.message);
  });
}
