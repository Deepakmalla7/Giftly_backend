import { CartModel, ICart } from "../models/cart.model";
import { CartItemType } from "../types/cart.type";

export interface ICartRepository {
    findByUserId(userId: string): Promise<ICart | null>;
    ensureCart(userId: string): Promise<ICart>;
    addItem(userId: string, item: CartItemType): Promise<ICart>;
    updateItemCount(userId: string, itemId: string, count: number): Promise<ICart | null>;
    removeItem(userId: string, itemId: string): Promise<ICart | null>;
    applyPromo(userId: string, code: string, discount: number): Promise<ICart>;
    clearCart(userId: string): Promise<ICart>;
}

export class CartRepository implements ICartRepository {
    async findByUserId(userId: string): Promise<ICart | null> {
        return CartModel.findOne({ user: userId });
    }

    async ensureCart(userId: string): Promise<ICart> {
        const cart = await CartModel.findOne({ user: userId });
        if (cart) return cart;
        return CartModel.create({ user: userId, items: [], discount: 0, serviceFee: 1.99 });
    }

    async addItem(userId: string, item: CartItemType): Promise<ICart> {
        const cart = await this.ensureCart(userId);
        cart.items.push(item as any);
        await cart.save();
        return cart;
    }

    async updateItemCount(userId: string, itemId: string, count: number): Promise<ICart | null> {
        const cart = await this.ensureCart(userId);
        const item = cart.items.find((i) => String(i._id) === itemId);
        if (!item) return null;
        item.count = count;
        await cart.save();
        return cart;
    }

    async removeItem(userId: string, itemId: string): Promise<ICart | null> {
        const cart = await this.ensureCart(userId);
        const item = cart.items.find((i) => String(i._id) === itemId);
        if (!item) return null;
        item.deleteOne();
        await cart.save();
        return cart;
    }

    async applyPromo(userId: string, code: string, discount: number): Promise<ICart> {
        const cart = await this.ensureCart(userId);
        cart.promoCode = code;
        cart.discount = discount;
        await cart.save();
        return cart;
    }

    async clearCart(userId: string): Promise<ICart> {
        const cart = await this.ensureCart(userId);
        cart.items = [];
        cart.discount = 0;
        cart.promoCode = undefined;
        await cart.save();
        return cart;
    }
}
