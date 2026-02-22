import { Router } from "express";
import { FavoriteController } from "../controllers/favorite.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const favoriteController = new FavoriteController();
const router = Router();

router.get("/", authorizedMiddleware, (req, res) => favoriteController.getFavorites(req, res));
router.post("/", authorizedMiddleware, (req, res) => favoriteController.addFavorite(req, res));
router.delete("/:itemId", authorizedMiddleware, (req, res) => favoriteController.removeFavorite(req, res));
router.post("/clear", authorizedMiddleware, (req, res) => favoriteController.clearFavorites(req, res));

export default router;
