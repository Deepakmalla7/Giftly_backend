import { ReviewRepository, IReviewFilter } from "../repositories/review.repository";
import { HttpError } from "../errors/http-error";
import { CreateReviewType, UpdateReviewStatusType } from "../types/review.type";

const reviewRepository = new ReviewRepository();

export class ReviewService {
    // User submits a review
    async createReview(userId: string, data: CreateReviewType) {
        // If gift-specific, check for duplicate
        if (data.giftId) {
            const exists = await reviewRepository.existsByUserAndGift(userId, data.giftId);
            if (exists) {
                throw new HttpError(409, "You have already submitted a review for this gift");
            }
        }

        const review = await reviewRepository.create({
            userId: userId as any,
            giftId: data.giftId as any,
            rating: data.rating,
            comment: data.comment,
            status: "pending",
        });

        return review;
    }

    // User gets their own reviews
    async getUserReviews(userId: string) {
        return reviewRepository.getByUserId(userId);
    }

    // Public: get approved reviews for a gift
    async getGiftReviews(giftId: string) {
        return reviewRepository.getApprovedByGiftId(giftId);
    }

    // Admin: get all reviews with filters + pagination
    async getAllReviews(filter: IReviewFilter) {
        return reviewRepository.getAll(filter);
    }

    // Admin: get review by id
    async getReviewById(id: string) {
        const review = await reviewRepository.getById(id);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }
        return review;
    }

    // Admin: approve or reject
    async updateReviewStatus(id: string, data: UpdateReviewStatusType) {
        const review = await reviewRepository.getById(id);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        const updated = await reviewRepository.updateStatus(id, data.status);
        return updated;
    }

    // Admin: delete review
    async deleteReview(id: string) {
        const review = await reviewRepository.getById(id);
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        await reviewRepository.delete(id);
        return { message: "Review deleted successfully" };
    }

    // Admin: stats
    async getReviewStats() {
        return reviewRepository.countByStatus();
    }
}
