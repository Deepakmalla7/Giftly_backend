import z from "zod";
import { CartItemSchema, PromoCodeSchema } from "../types/cart.type";

export const addCartItemDto = CartItemSchema;
export type addCartItemDto = z.infer<typeof addCartItemDto>;

export const updateCartItemDto = z.object({
    count: z.number().int().min(1, "Count must be at least 1")
});
export type updateCartItemDto = z.infer<typeof updateCartItemDto>;

export const applyPromoDto = PromoCodeSchema;
export type applyPromoDto = z.infer<typeof applyPromoDto>;
