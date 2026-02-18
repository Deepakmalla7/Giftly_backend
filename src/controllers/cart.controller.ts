import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import { HttpError } from "../errors/http-error";
import { addCartItemDto, updateCartItemDto, applyPromoDto } from "../dtos/cart.dto";
import z from "zod";
import mongoose from "mongoose";

const cartService = new CartService();

export class CartController {
    async getCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const result = await cartService.getCart(userId);
            return res.status(200).json({
                success: true,
                message: "Cart fetched successfully",
                data: result
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async addItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = addCartItemDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: z.prettifyError(parsed.error)
                });
            }

            const result = await cartService.addItem(userId, parsed.data);
            return res.status(201).json({
                success: true,
                message: "Item added to cart",
                data: result
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async updateItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { itemId } = req.params;
            if (!mongoose.isValidObjectId(itemId)) {
                return res.status(400).json({ success: false, message: "Invalid item ID" });
            }

            const parsed = updateCartItemDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: z.prettifyError(parsed.error)
                });
            }

            const result = await cartService.updateItemCount(userId, itemId, parsed.data.count);
            return res.status(200).json({
                success: true,
                message: "Cart item updated",
                data: result
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async removeItem(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { itemId } = req.params;
            if (!mongoose.isValidObjectId(itemId)) {
                return res.status(400).json({ success: false, message: "Invalid item ID" });
            }

            const result = await cartService.removeItem(userId, itemId);
            return res.status(200).json({
                success: true,
                message: "Cart item removed",
                data: result
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async applyPromo(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = applyPromoDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: z.prettifyError(parsed.error)
                });
            }

            const result = await cartService.applyPromo(userId, parsed.data.code);
            return res.status(200).json({
                success: true,
                message: "Promo code applied",
                data: result
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async clearCart(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const result = await cartService.clearCart(userId);
            return res.status(200).json({
                success: true,
                message: "Cart cleared",
                data: result
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
}
