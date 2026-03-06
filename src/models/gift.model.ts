import mongoose, { Schema, Document } from "mongoose";
import { GiftType } from "../types/gift.type";

const giftSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true, index: true },
        price: { type: Number, required: true, index: true },
        occasion: { type: [String], default: [], index: true },
        recipientType: { type: String, required: false },
        ageGroup: { type: String, required: false },
        relationshipType: { type: String, required: false },
        interests: { type: [String], default: [] },
        tags: { type: [String], default: [], index: true },
        popularityScore: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        imageUrl: { type: String, required: false },
        stock: { type: Number, required: false, default: 0 },
        isAvailable: { type: Boolean, default: true, index: true },
        isDeleted: { type: Boolean, default: false, index: true }
    },
    {
        timestamps: true
    }
);

export interface IGift extends GiftType, Document {
    _id: mongoose.Types.ObjectId;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export const GiftModel = mongoose.model<IGift>("Gift", giftSchema);
