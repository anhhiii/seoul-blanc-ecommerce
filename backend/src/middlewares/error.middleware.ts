import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/index.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.stack);

  if (err instanceof HttpException) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
