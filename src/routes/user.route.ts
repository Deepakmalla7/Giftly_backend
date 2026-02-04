import { Router } from "express";
import { AuthController } from "../controllers/user.controller";
import { Request, Response } from "express";
import { uploads } from "../middlewares/upload_middleware";

let authController = new AuthController();
const router = Router();

// Auth routes
router.post("/register", (req, res) => authController.createUser(req, res));
router.post("/login", (req, res) => authController.loginUser(req, res));
router.post("/logout", (req, res) => authController.logoutUser(req, res));
router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/verify-otp", (req, res) => authController.verifyOTP(req, res));
router.post("/reset-password", (req, res) => authController.resetPassword(req, res));
router.post("/reset-password-otp", (req, res) => authController.resetPasswordWithOTP(req, res));

// Photo routes  
router.post("/upload-photo", uploads.single("photo"), (req: Request, res: Response) => authController.uploadUserPhoto(req, res));
router.delete("/delete-photo", (req, res) => authController.deleteUserPhoto(req, res));

// Profile routes
router.get('/profile/:id', (req, res) => authController.getUserProfile(req, res));

// User update/delete routes (must come last due to :id parameter)
router.put('/:id', uploads.single("photo"), (req, res) => authController.updateUserProfile(req, res));
router.delete('/:id', (req, res) => authController.deleteUser(req, res));

// Test route
router.get("/test", (req: Request, res: Response) => {
    res.send("User route working");
});

export default router;
