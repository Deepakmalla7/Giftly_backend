import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const cartController = new CartController();
const router = Router();

router.get("/", authorizedMiddleware, (req, res) => cartController.getCart(req, res));
router.post("/items", authorizedMiddleware, (req, res) => cartController.addItem(req, res));
router.patch("/items/:itemId", authorizedMiddleware, (req, res) => cartController.updateItem(req, res));
router.delete("/items/:itemId", authorizedMiddleware, (req, res) => cartController.removeItem(req, res));
router.post("/promo", authorizedMiddleware, (req, res) => cartController.applyPromo(req, res));
router.post("/clear", authorizedMiddleware, (req, res) => cartController.clearCart(req, res));

export default router;
