import { FavoriteListModel, IFavoriteList } from "../models/favorite.model";
import { FavoriteItemType } from "../types/favorite.type";

export interface IFavoriteRepository {
    findByUserId(userId: string): Promise<IFavoriteList | null>;
    ensureList(userId: string): Promise<IFavoriteList>;
    addItem(userId: string, item: FavoriteItemType): Promise<IFavoriteList>;
    removeItem(userId: string, itemId: string): Promise<IFavoriteList | null>;
    clearAll(userId: string): Promise<IFavoriteList>;
}

export class FavoriteRepository implements IFavoriteRepository {
    async findByUserId(userId: string): Promise<IFavoriteList | null> {
        return FavoriteListModel.findOne({ user: userId });
    }

    async ensureList(userId: string): Promise<IFavoriteList> {
        const list = await FavoriteListModel.findOne({ user: userId });
        if (list) return list;
        return FavoriteListModel.create({ user: userId, items: [] });
    }

    async addItem(userId: string, item: FavoriteItemType): Promise<IFavoriteList> {
        const list = await this.ensureList(userId);
        const exists = list.items.some((i) => i.title === item.title);
        if (!exists) {
            list.items.push(item as any);
            await list.save();
        }
        return list;
    }

    async removeItem(userId: string, itemId: string): Promise<IFavoriteList | null> {
        const list = await this.ensureList(userId);
        const item = list.items.find((i) => String(i._id) === itemId);
        if (!item) return null;
        item.deleteOne();
        await list.save();
        return list;
    }

    async clearAll(userId: string): Promise<IFavoriteList> {
        const list = await this.ensureList(userId);
        list.items = [];
        await list.save();
        return list;
    }
}
