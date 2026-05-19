import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { HttpException } from '../exceptions/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

// Middleware to verify if request is authenticated using JWT
export const verifyToken = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(401, 'Unauthorized: Access token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'seoul_blanc_super_secret_minimalist_key_2026'
      ) as {
        id: string;
        email: string;
        role: 'USER' | 'ADMIN';
      };

      // Verify user still exists in MongoDB
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        throw new HttpException(401, 'Unauthorized: User does not exist');
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      next();
    } catch {
      throw new HttpException(401, 'Unauthorized: Invalid token');
    }
  }
);

// Middleware to authorize Admin access only
export const isAdmin = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new HttpException(403, 'Forbidden: Admin access only');
  }
  next();
};
