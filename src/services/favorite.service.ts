import { FavoriteRepository } from "../repositories/favorite.repository";
import { HttpError } from "../errors/http-error";
import { FavoriteItemType } from "../types/favorite.type";

const favoriteRepository = new FavoriteRepository();

export class FavoriteService {
    async getFavorites(userId: string) {
        const list = await favoriteRepository.ensureList(userId);
        return list.items;
    }

    async addFavorite(userId: string, item: FavoriteItemType) {
        const list = await favoriteRepository.addItem(userId, item);
        return list.items;
    }

    async removeFavorite(userId: string, itemId: string) {
        const list = await favoriteRepository.removeItem(userId, itemId);
        if (!list) {
            throw new HttpError(404, "Favorite item not found");
        }
        return list.items;
    }

    async clearFavorites(userId: string) {
        const list = await favoriteRepository.clearAll(userId);
        return list.items;
    }
}
