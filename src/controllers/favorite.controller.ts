import { Request, Response } from "express";
import { FavoriteService } from "../services/favorite.service";
import { HttpError } from "../errors/http-error";
import { addFavoriteDto } from "../dtos/favorite.dto";
import z from "zod";
import mongoose from "mongoose";

const favoriteService = new FavoriteService();

export class FavoriteController {
    async getFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const favorites = await favoriteService.getFavorites(userId);
            return res.status(200).json({
                success: true,
                message: "Favorites fetched successfully",
                data: favorites
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async addFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = addFavoriteDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: z.prettifyError(parsed.error)
                });
            }

            const favorites = await favoriteService.addFavorite(userId, parsed.data);
            return res.status(201).json({
                success: true,
                message: "Favorite added",
                data: favorites
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async removeFavorite(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { itemId } = req.params;
            if (!mongoose.isValidObjectId(itemId)) {
                return res.status(400).json({ success: false, message: "Invalid item ID" });
            }

            const favorites = await favoriteService.removeFavorite(userId, itemId);
            return res.status(200).json({
                success: true,
                message: "Favorite removed",
                data: favorites
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async clearFavorites(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const favorites = await favoriteService.clearFavorites(userId);
            return res.status(200).json({
                success: true,
                message: "Favorites cleared",
                data: favorites
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
}
