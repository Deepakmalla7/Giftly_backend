import z from "zod";

export const CartItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    recipient: z.string().min(1, "Recipient is required"),
    price: z.number().min(0, "Price must be a positive number"),
    count: z.number().int().min(1, "Count must be at least 1"),
    color: z.string().optional(),
    image: z.string().optional()
});

export type CartItemType = z.infer<typeof CartItemSchema>;

export const PromoCodeSchema = z.object({
    code: z.string().min(1, "Promo code is required")
});

export type PromoCodeType = z.infer<typeof PromoCodeSchema>;
