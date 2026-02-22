import mongoose, { Schema, Document } from "mongoose";
import { CartItemType } from "../types/cart.type";

export interface ICartItem extends CartItemType, Document {
    _id: mongoose.Types.ObjectId;
}

export interface ICart extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
    promoCode?: string;
    discount: number;
    serviceFee: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const cartItemSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    recipient: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    count: { type: Number, required: true, min: 1 },
    color: { type: String, default: null },
    image: { type: String, default: null }
});

const cartSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        items: { type: [cartItemSchema], default: [] },
        promoCode: { type: String, default: null },
        discount: { type: Number, default: 0, min: 0 },
        serviceFee: { type: Number, default: 1.99, min: 0 }
    },
    {
        timestamps: true
    }
);

export const CartModel = mongoose.model<ICart>("Cart", cartSchema);
