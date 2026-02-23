import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { uploads } from "../../middlewares/upload_middleware";

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

// All routes require authentication and admin role

/**
 * POST /api/admin/users
 * Create a new user with optional profile picture
 */
adminUserRouter.post(
    "/",
    authorizedMiddleware,
    adminMiddleware,
    uploads.single("photo"),
    (req, res) => adminUserController.createUser(req, res)
);

/**
 * GET /api/admin/users
 * Get users with pagination, search, and filters
 * Query: ?search=&role=&accountStatus=&page=&limit=
 */
adminUserRouter.get(
    "/",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.getAllUsers(req, res)
);

/**
 * GET /api/admin/users/:id
 * Get user by ID
 */
adminUserRouter.get(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.getUserById(req, res)
);

/**
 * PUT /api/admin/users/:id
 * Update user by ID with optional profile picture
 */
adminUserRouter.put(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    uploads.single("photo"),
    (req, res) => adminUserController.updateUser(req, res)
);

/**
 * PUT /api/admin/users/:id/restore
 * Restore a soft-deleted user
 */
adminUserRouter.put(
    "/:id/restore",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.restoreUser(req, res)
);

/**
 * PUT /api/admin/users/:id/reset-password
 * Reset user password
 */
adminUserRouter.put(
    "/:id/reset-password",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.resetPassword(req, res)
);

/**
 * PUT /api/admin/users/:id/toggle-status
 * Toggle user active/inactive status
 */
adminUserRouter.put(
    "/:id/toggle-status",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.toggleStatus(req, res)
);

/**
 * DELETE /api/admin/users/:id
 * Soft delete (deactivate) user
 */
adminUserRouter.delete(
    "/:id",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.deleteUser(req, res)
);

/**
 * DELETE /api/admin/users/:id/permanent
 * Permanently delete user (hard delete)
 */
adminUserRouter.delete(
    "/:id/permanent",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => adminUserController.permanentDeleteUser(req, res)
);

export default adminUserRouter;