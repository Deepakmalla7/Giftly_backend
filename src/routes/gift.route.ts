import { Router } from "express";
import { GiftController } from "../controllers/gift.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { uploads } from "../middlewares/upload_middleware";

const giftController = new GiftController();
const router = Router();
const uploadSingle = uploads.single("image");

// Public routes
router.get("/", (req, res) => giftController.getAllGifts(req, res));
router.get("/filter", (req, res) => giftController.filterGifts(req, res));
router.get("/recommendation", (req, res) => giftController.getRecommendedGifts(req, res));
router.get("/recommendations", (req, res) => giftController.getGiftRecommendations(req, res));

// Stats (admin)
router.get("/stats", authorizedMiddleware, adminMiddleware, (req, res) => giftController.getGiftStats(req, res));

// Authenticated routes
router.post("/preferences", authorizedMiddleware, (req, res) => giftController.updateUserPreferences(req, res));

// Gift by ID (public read)
router.get("/:id", (req, res) => giftController.getGiftById(req, res));

// Admin CRUD with image upload
router.post("/", authorizedMiddleware, adminMiddleware, uploadSingle, (req, res) => giftController.createGift(req, res));
router.put("/:id", authorizedMiddleware, adminMiddleware, uploadSingle, (req, res) => giftController.updateGift(req, res));
router.delete("/:id", authorizedMiddleware, adminMiddleware, (req, res) => giftController.deleteGift(req, res));
router.delete("/:id/permanent", authorizedMiddleware, adminMiddleware, (req, res) => giftController.permanentDeleteGift(req, res));
router.patch("/:id/restore", authorizedMiddleware, adminMiddleware, (req, res) => giftController.restoreGift(req, res));

export default router;
