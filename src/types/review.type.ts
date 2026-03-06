import z from "zod";

export const ReviewSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    giftId: z.string().optional(),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().min(3, "Comment must be at least 3 characters").max(1000, "Comment cannot exceed 1000 characters"),
    status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export type ReviewType = z.infer<typeof ReviewSchema>;

// For user submission — userId comes from auth, status defaults to pending
export const CreateReviewSchema = z.object({
    giftId: z.string().optional(),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().min(3, "Comment must be at least 3 characters").max(1000, "Comment cannot exceed 1000 characters"),
});

export type CreateReviewType = z.infer<typeof CreateReviewSchema>;

// For admin status update
export const UpdateReviewStatusSchema = z.object({
    status: z.enum(["approved", "rejected"]),
});

export type UpdateReviewStatusType = z.infer<typeof UpdateReviewStatusSchema>;
