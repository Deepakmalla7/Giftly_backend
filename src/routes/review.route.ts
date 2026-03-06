import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const reviewController = new ReviewController();
const router = Router();

// ── User routes (authenticated) ──
router.post("/", authorizedMiddleware, (req, res) => reviewController.createReview(req, res));
router.get("/my", authorizedMiddleware, (req, res) => reviewController.getMyReviews(req, res));

// ── Public routes ──
router.get("/gift/:giftId", (req, res) => reviewController.getGiftReviews(req, res));

// ── Admin routes (authenticated + admin) ──
router.get("/stats", authorizedMiddleware, adminMiddleware, (req, res) => reviewController.getReviewStats(req, res));
router.get("/", authorizedMiddleware, adminMiddleware, (req, res) => reviewController.getAllReviews(req, res));
router.get("/:id", authorizedMiddleware, adminMiddleware, (req, res) => reviewController.getReviewById(req, res));
router.put("/:id/status", authorizedMiddleware, adminMiddleware, (req, res) => reviewController.updateReviewStatus(req, res));
router.delete("/:id", authorizedMiddleware, adminMiddleware, (req, res) => reviewController.deleteReview(req, res));

export default router;
