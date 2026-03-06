// Global Error Handling Middleware
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  stack?: string;
  errors?: any;
}

/**
 * Global error handler middleware
 * Must be used as the last middleware in the chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle known HttpError
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    } as ErrorResponse);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      statusCode: 400,
      errors: err,
    } as ErrorResponse);
    return;
  }

  // Handle Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry. Resource already exists.',
      statusCode: 409,
    } as ErrorResponse);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      statusCode: 401,
    } as ErrorResponse);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      statusCode: 401,
    } as ErrorResponse);
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  } as ErrorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  } as ErrorResponse);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
