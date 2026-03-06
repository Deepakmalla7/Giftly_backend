import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import { Iuser } from "../../models/user_model";

const adminUserService = new AdminUserService();

export class AdminUserController {
    /**
     * POST /api/admin/users
     * Create a new user with optional profile picture
     */
    async createUser(req: Request, res: Response) {
        try {
            const userData = req.body;
            const profilePicture = req.file ? req.file.path : undefined;

            const newUser = await adminUserService.createUser(userData, profilePicture);

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser
            });
        } catch (err: any) {
            console.error("Error creating user:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to create user"
            });
        }
    }

    /**
     * GET /api/admin/users
     * Get users with optional search, pagination, and filters
     * Query params: search, role, accountStatus, page, limit
     */
    async getAllUsers(req: Request, res: Response) {
        try {
            const { search, role, accountStatus, page, limit } = req.query;

            const result = await adminUserService.getUsersPaginated({
                search: search as string,
                role: role as string,
                accountStatus: accountStatus as string,
                page: page ? parseInt(page as string, 10) : 1,
                limit: limit ? parseInt(limit as string, 10) : 10
            });

            return res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: result.users,
                pagination: result.pagination
            });
        } catch (err: any) {
            console.error("Error fetching users:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to fetch users"
            });
        }
    }

    /**
     * GET /api/admin/users/:id
     * Get user by ID
     */
    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await adminUserService.getUserById(id);

            return res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                data: user
            });
        } catch (err: any) {
            console.error("Error fetching user:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to fetch user"
            });
        }
    }

    /**
     * PUT /api/admin/users/:id
     * Update user by ID with optional profile picture
     */
    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const profilePicture = req.file ? req.file.path : undefined;

            const updatedUser = await adminUserService.updateUser(id, updateData, profilePicture);

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: updatedUser
            });
        } catch (err: any) {
            console.error("Error updating user:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to update user"
            });
        }
    }

    /**
     * DELETE /api/admin/users/:id
     * Soft delete (deactivate) user by ID
     * Prevents self-delete
     */
    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminUser = req.user as Iuser;
            const adminUserId = adminUser._id.toString();

            const result = await adminUserService.softDeleteUser(id, adminUserId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.user
            });
        } catch (err: any) {
            console.error("Error deleting user:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to delete user"
            });
        }
    }

    /**
     * PUT /api/admin/users/:id/restore
     * Restore a soft-deleted (inactive) user
     */
    async restoreUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await adminUserService.restoreUser(id);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.user
            });
        } catch (err: any) {
            console.error("Error restoring user:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to restore user"
            });
        }
    }

    /**
     * DELETE /api/admin/users/:id/permanent
     * Permanently delete a user (hard delete)
     */
    async permanentDeleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminUser = req.user as Iuser;
            const adminUserId = adminUser._id.toString();

            const result = await adminUserService.deleteUser(id, adminUserId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: { id }
            });
        } catch (err: any) {
            console.error("Error permanently deleting user:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to permanently delete user"
            });
        }
    }

    /**
     * PUT /api/admin/users/:id/reset-password
     * Reset user password
     */
    async resetPassword(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 3 characters"
                });
            }

            const result = await adminUserService.resetUserPassword(id, newPassword);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (err: any) {
            console.error("Error resetting password:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to reset password"
            });
        }
    }

    /**
     * PUT /api/admin/users/:id/toggle-status
     * Toggle user active/inactive status
     */
    async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const adminUser = req.user as Iuser;
            const adminUserId = adminUser._id.toString();

            const result = await adminUserService.toggleUserStatus(id, adminUserId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.user
            });
        } catch (err: any) {
            console.error("Error toggling user status:", err);
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to toggle user status"
            });
        }
    }
}


