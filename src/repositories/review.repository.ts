import { ReviewModel, IReview } from "../models/review.model";

export interface IReviewFilter {
    status?: string;
    userId?: string;
    giftId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface IPaginatedReviews {
    data: IReview[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ReviewRepository {
    async create(data: Partial<IReview>): Promise<IReview> {
        const review = new ReviewModel(data);
        await review.save();
        return review;
    }

    async getById(id: string): Promise<IReview | null> {
        return ReviewModel.findById(id)
            .populate("userId", "firstName lastName email profilePicture")
            .populate("giftId", "name imageUrl category price");
    }

    async getAll(filter: IReviewFilter): Promise<IPaginatedReviews> {
        const query: Record<string, any> = {};
        const page = filter.page || 1;
        const limit = filter.limit || 20;
        const skip = (page - 1) * limit;

        if (filter.status && filter.status !== "all") {
            query.status = filter.status;
        }

        if (filter.userId) {
            query.userId = filter.userId;
        }

        if (filter.giftId) {
            query.giftId = filter.giftId;
        }

        // Search in comment text (case-insensitive)
        if (filter.search) {
            query.comment = { $regex: filter.search, $options: "i" };
        }

        const [data, total] = await Promise.all([
            ReviewModel.find(query)
                .populate("userId", "firstName lastName email profilePicture")
                .populate("giftId", "name imageUrl category price")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ReviewModel.countDocuments(query),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getByUserId(userId: string): Promise<IReview[]> {
        return ReviewModel.find({ userId })
            .populate("giftId", "name imageUrl category price")
            .sort({ createdAt: -1 });
    }

    async getApprovedByGiftId(giftId: string): Promise<IReview[]> {
        return ReviewModel.find({ giftId, status: "approved" })
            .populate("userId", "firstName lastName profilePicture")
            .sort({ createdAt: -1 });
    }

    async updateStatus(id: string, status: "approved" | "rejected"): Promise<IReview | null> {
        return ReviewModel.findByIdAndUpdate(id, { status }, { new: true })
            .populate("userId", "firstName lastName email profilePicture")
            .populate("giftId", "name imageUrl category price");
    }

    async delete(id: string): Promise<boolean> {
        const result = await ReviewModel.findByIdAndDelete(id);
        return !!result;
    }

    async countByStatus(): Promise<{ total: number; pending: number; approved: number; rejected: number; avgRating: number }> {
        const [total, pending, approved, rejected, ratingAgg] = await Promise.all([
            ReviewModel.countDocuments(),
            ReviewModel.countDocuments({ status: "pending" }),
            ReviewModel.countDocuments({ status: "approved" }),
            ReviewModel.countDocuments({ status: "rejected" }),
            ReviewModel.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
            avgRating: ratingAgg.length > 0 ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
        };
    }

    async existsByUserAndGift(userId: string, giftId: string): Promise<boolean> {
        const existing = await ReviewModel.findOne({ userId, giftId });
        return !!existing;
    }
}
