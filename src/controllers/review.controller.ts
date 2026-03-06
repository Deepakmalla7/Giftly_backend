import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { CreateReviewSchema, UpdateReviewStatusSchema } from "../types/review.type";
const reviewService = new ReviewService();

export class ReviewController {
    // POST /api/reviews — User submits a review (authenticated)
    async createReview(req: Request, res: Response) {
        try {
            const userId = (req as any).user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const validated = CreateReviewSchema.parse(req.body);
            const review = await reviewService.createReview(userId, validated);

            return res.status(201).json({
                success: true,
                message: "Review submitted successfully. It will be visible after admin approval.",
                data: review,
            });
        } catch (err: any) {
            if (err.issues) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: err.issues.map((e: any) => ({ field: e.path.join("."), message: e.message })),
                });
            }
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to create review",
            });
        }
    }

    // GET /api/reviews/my — User gets their own reviews (authenticated)
    async getMyReviews(req: Request, res: Response) {
        try {
            const userId = (req as any).user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const reviews = await reviewService.getUserReviews(userId);

            return res.json({
                success: true,
                data: reviews,
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to fetch reviews",
            });
        }
    }

    // GET /api/reviews/gift/:giftId — Public: approved reviews for a gift
    async getGiftReviews(req: Request, res: Response) {
        try {
            const { giftId } = req.params;
            const reviews = await reviewService.getGiftReviews(giftId);

            return res.json({
                success: true,
                data: reviews,
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to fetch gift reviews",
            });
        }
    }

    // GET /api/reviews — Admin: get all reviews with filters
    async getAllReviews(req: Request, res: Response) {
        try {
            const { status, search, page, limit } = req.query;

            const result = await reviewService.getAllReviews({
                status: status as string,
                search: search as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 20,
            });

            return res.json({
                success: true,
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to fetch reviews",
            });
        }
    }

    // GET /api/reviews/stats — Admin: review stats
    async getReviewStats(req: Request, res: Response) {
        try {
            const stats = await reviewService.getReviewStats();
            return res.json({ success: true, data: stats });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to fetch stats",
            });
        }
    }

    // GET /api/reviews/:id — Admin: get single review
    async getReviewById(req: Request, res: Response) {
        try {
            const review = await reviewService.getReviewById(req.params.id);
            return res.json({ success: true, data: review });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Review not found",
            });
        }
    }

    // PUT /api/reviews/:id/status — Admin: approve or reject
    async updateReviewStatus(req: Request, res: Response) {
        try {
            const validated = UpdateReviewStatusSchema.parse(req.body);
            const review = await reviewService.updateReviewStatus(req.params.id, validated);

            return res.json({
                success: true,
                message: `Review ${validated.status} successfully`,
                data: review,
            });
        } catch (err: any) {
            if (err.issues) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: err.issues.map((e: any) => ({ field: e.path.join("."), message: e.message })),
                });
            }
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to update review status",
            });
        }
    }

    // DELETE /api/reviews/:id — Admin: delete review
    async deleteReview(req: Request, res: Response) {
        try {
            const result = await reviewService.deleteReview(req.params.id);
            return res.json({ success: true, ...result });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Failed to delete review",
            });
        }
    }
}
