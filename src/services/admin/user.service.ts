import bcryptjs from "bcryptjs";
import { UserRepository } from "../../repositories/user.repository";
import { createUserDto } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
import { Iuser } from "../../models/user_model";
import fs from "fs";
import path from "path";

const userRepository = new UserRepository();

export class AdminUserService {
    private normalizeProfilePath(photoPath?: string) {
        if (!photoPath) return "";
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
        if (photoPath.startsWith('/uploads/')) return photoPath;
        const parts = photoPath.split(/[/\\]/);
        const fileName = parts[parts.length - 1];
        return `/uploads/${fileName}`;
    }

    /** Strip password from user object for API response */
    private toUserResponse(user: any) {
        return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            age: user.age,
            gender: user.gender,
            event: user.event,
            role: user.role,
            accountStatus: user.accountStatus || "active",
            profilePicture: this.normalizeProfilePath(user.profilePicture),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    /**
     * Create a new user (admin only)
     */
    async createUser(userData: Partial<Iuser>, profilePicture?: string) {
        const checkEmail = await userRepository.getUserByEmail(userData.email!);
        if (checkEmail) {
            throw new HttpError(409, "Email already in use");
        }

        const checkUsername = await userRepository.getUserByUsername(userData.username!);
        if (checkUsername) {
            throw new HttpError(409, "Username already in use");
        }

        if (userData.password) {
            userData.password = await bcryptjs.hash(userData.password, 10);
        }

        if (profilePicture) {
            userData.profilePicture = this.normalizeProfilePath(profilePicture);
        }

        // Set default account status if not provided
        if (!userData.accountStatus) {
            userData.accountStatus = "active";
        }

        const newUser = await userRepository.createUser(userData);
        return this.toUserResponse(newUser);
    }

    /**
     * Get all users (admin only) — no pagination, returns all
     */
    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        return users.map(user => this.toUserResponse(user));
    }

    /**
     * Get users with pagination, search, and filters
     */
    async getUsersPaginated(params: {
        search?: string;
        role?: string;
        accountStatus?: string;
        page?: number;
        limit?: number;
    }) {
        const { search, role, accountStatus, page = 1, limit = 10 } = params;

        // Build MongoDB filter
        const filter: Record<string, any> = {};

        // Search across name, email, username
        if (search && search.trim()) {
            const searchRegex = { $regex: search.trim(), $options: "i" };
            filter.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { username: searchRegex }
            ];
        }

        // Filter by role
        if (role && (role === "user" || role === "admin")) {
            filter.role = role;
        }

        // Filter by account status
        if (accountStatus && (accountStatus === "active" || accountStatus === "inactive")) {
            filter.accountStatus = accountStatus;
        }

        const [users, total] = await Promise.all([
            userRepository.getUsersPaginated(filter, page, limit, { createdAt: -1 }),
            userRepository.countUsers(filter)
        ]);

        return {
            users: users.map(user => this.toUserResponse(user)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user by ID (admin only)
     */
    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return this.toUserResponse(user);
    }

    /**
     * Update user by ID (admin only)
     */
    async updateUser(userId: string, updateData: Partial<Iuser>, profilePicture?: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail) {
                throw new HttpError(409, "Email already in use");
            }
        }

        if (updateData.username && updateData.username !== user.username) {
            const existingUsername = await userRepository.getUserByUsername(updateData.username);
            if (existingUsername) {
                throw new HttpError(409, "Username already in use");
            }
        }

        if (updateData.password) {
            updateData.password = await bcryptjs.hash(updateData.password, 10);
        }

        if (profilePicture && user.profilePicture) {
            try {
                const oldPhotoPath = path.join(__dirname, '../../../uploads', path.basename(user.profilePicture));
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            } catch (err) {
                console.error("Error deleting old profile picture:", err);
            }
        }

        if (profilePicture) {
            updateData.profilePicture = this.normalizeProfilePath(profilePicture);
        }

        const updatedUser = await userRepository.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new HttpError(500, "Failed to update user");
        }

        return this.toUserResponse(updatedUser);
    }

    /**
     * Soft delete user by ID (sets accountStatus to inactive)
     * Prevents self-delete: adminUserId must differ from target userId
     */
    async softDeleteUser(userId: string, adminUserId: string) {
        if (userId === adminUserId) {
            throw new HttpError(400, "You cannot deactivate your own account");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const deactivated = await userRepository.softDeleteUser(userId);
        if (!deactivated) {
            throw new HttpError(500, "Failed to deactivate user");
        }

        return { message: "User deactivated successfully", user: this.toUserResponse(deactivated) };
    }

    /**
     * Restore a soft-deleted (inactive) user
     */
    async restoreUser(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const restored = await userRepository.restoreUser(userId);
        if (!restored) {
            throw new HttpError(500, "Failed to restore user");
        }

        return { message: "User restored successfully", user: this.toUserResponse(restored) };
    }

    /**
     * Hard delete user by ID (permanent removal)
     * Prevents self-delete: adminUserId must differ from target userId
     */
    async deleteUser(userId: string, adminUserId?: string) {
        if (adminUserId && userId === adminUserId) {
            throw new HttpError(400, "You cannot delete your own account");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Delete profile picture if exists
        if (user.profilePicture) {
            try {
                const photoPath = path.join(__dirname, '../../../uploads', path.basename(user.profilePicture));
                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            } catch (err) {
                console.error("Error deleting profile picture:", err);
            }
        }

        const deleted = await userRepository.deleteUser(userId);
        if (!deleted) {
            throw new HttpError(500, "Failed to delete user");
        }

        return { message: "User deleted permanently" };
    }

    /**
     * Reset user password (admin only)
     */
    async resetUserPassword(userId: string, newPassword: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        const updated = await userRepository.updateUser(userId, { password: hashedPassword } as Partial<Iuser>);
        if (!updated) {
            throw new HttpError(500, "Failed to reset password");
        }

        return { message: "Password reset successfully" };
    }

    /**
     * Toggle user status (active <-> inactive)
     */
    async toggleUserStatus(userId: string, adminUserId: string) {
        if (userId === adminUserId) {
            throw new HttpError(400, "You cannot change your own account status");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const newStatus = user.accountStatus === "active" ? "inactive" : "active";
        const updated = await userRepository.updateUser(userId, { accountStatus: newStatus } as Partial<Iuser>);
        if (!updated) {
            throw new HttpError(500, "Failed to toggle user status");
        }

        return { message: `User status changed to ${newStatus}`, user: this.toUserResponse(updated) };
    }
}