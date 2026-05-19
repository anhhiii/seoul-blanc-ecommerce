import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'seoul_blanc_super_secret_minimalist_key_2026';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'seoul_blanc_super_secret_refresh_key_2026';

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};
