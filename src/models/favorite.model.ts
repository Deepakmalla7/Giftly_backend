import mongoose, { Schema, Document } from "mongoose";
import { FavoriteItemType } from "../types/favorite.type";

export interface IFavoriteItem extends FavoriteItemType, Document {
    _id: mongoose.Types.ObjectId;
}

export interface IFavoriteList extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: IFavoriteItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

const favoriteItemSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0 }
});

const favoriteListSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        items: { type: [favoriteItemSchema], default: [] }
    },
    {
        timestamps: true
    }
);

export const FavoriteListModel = mongoose.model<IFavoriteList>("FavoriteList", favoriteListSchema);
