import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    giftId?: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        giftId: {
            type: Schema.Types.ObjectId,
            ref: "Gift",
            required: false,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: one review per user per gift
reviewSchema.index({ userId: 1, giftId: 1 }, { unique: true, sparse: true });

export const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);
