import z from "zod";

export const FavoriteItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    image: z.string().min(1, "Image is required"),
    rating: z.number().min(0, "Rating must be a positive number")
});

export type FavoriteItemType = z.infer<typeof FavoriteItemSchema>;
