import { CartRepository } from "../repositories/cart.repository";
import { HttpError } from "../errors/http-error";
import { ICart } from "../models/cart.model";
import { CartItemType } from "../types/cart.type";

const PROMO_CODES: Record<string, number> = {
    GIFTLY3: 3,
    SPARK5: 5
};

const buildTotals = (cart: ICart) => {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.count, 0);
    const discount = cart.discount || 0;
    const serviceFee = subtotal === 0 ? 0 : cart.serviceFee;
    const total = Math.max(0, subtotal + serviceFee - discount);
    return { subtotal, discount, serviceFee, total };
};

const cartRepository = new CartRepository();

export class CartService {
    async getCart(userId: string) {
        const cart = await cartRepository.ensureCart(userId);
        return { cart, totals: buildTotals(cart) };
    }

    async addItem(userId: string, item: CartItemType) {
        const cart = await cartRepository.addItem(userId, item);
        return { cart, totals: buildTotals(cart) };
    }

    async updateItemCount(userId: string, itemId: string, count: number) {
        const cart = await cartRepository.updateItemCount(userId, itemId, count);
        if (!cart) {
            throw new HttpError(404, "Cart item not found");
        }
        return { cart, totals: buildTotals(cart) };
    }

    async removeItem(userId: string, itemId: string) {
        const cart = await cartRepository.removeItem(userId, itemId);
        if (!cart) {
            throw new HttpError(404, "Cart item not found");
        }
        return { cart, totals: buildTotals(cart) };
    }

    async applyPromo(userId: string, code: string) {
        const normalizedCode = code.trim().toUpperCase();
        const discount = PROMO_CODES[normalizedCode];
        if (!discount) {
            throw new HttpError(404, "Promo code not valid");
        }
        const cart = await cartRepository.applyPromo(userId, normalizedCode, discount);
        return { cart, totals: buildTotals(cart) };
    }

    async clearCart(userId: string) {
        const cart = await cartRepository.clearCart(userId);
        return { cart, totals: buildTotals(cart) };
    }
}
