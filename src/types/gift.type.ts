import z from "zod";

export const GiftSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    price: z.number().min(0, "Price must be a positive number"),
    occasion: z.array(z.string().min(1)).default([]),
    recipientType: z.string().optional(),
    ageGroup: z.string().optional(),
    relationshipType: z.string().optional(),
    interests: z.array(z.string().min(1)).default([]),
    tags: z.array(z.string().min(1)).default([]),
    popularityScore: z.number().min(0).default(0),
    rating: z.number().min(0).max(5).optional(),
    imageUrl: z.string().optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().default(true)
});

export type GiftType = z.infer<typeof GiftSchema>;
