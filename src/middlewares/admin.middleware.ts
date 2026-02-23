import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { Iuser } from '../models/user_model';

/**
 * Middleware to check if the authenticated user has admin role
 * Must be used after authorizedMiddleware to ensure req.user is populated
 */
export const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Check if user exists on request (should be set by authorizedMiddleware)
        if (!req.user) {
            throw new HttpError(401, 'Unauthorized - No user found');
        }

        const user = req.user as Iuser;

        // Check if user has admin role
        if (user.role !== 'admin') {
            throw new HttpError(403, 'Forbidden - Admin access required');
        }

        // User is admin, proceed to next middleware/controller
        next();
    } catch (err: Error | any) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });
    }
};
