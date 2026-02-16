import { GiftRepository, IGiftFilter, IPaginatedResult } from "../repositories/gift.repository";
import { HttpError } from "../errors/http-error";
import { IGift } from "../models/gift.model";
import { createGiftDto } from "../dtos/gift.dto";

const giftRepository = new GiftRepository();

export class GiftService {
    async getGiftRecommendations(
        age: number,
        event: string,
        gender: string,
        page: number = 1,
        limit: number = 20
    ) {
        const eventTagMap: Record<string, string[]> = {
            birthday: ["birthday", "celebration", "fun"],
            anniversary: ["anniversary", "romantic", "love"],
            wedding: ["wedding", "couple", "romantic"]
        };

        let ageCategory = "";
        if (age < 18) {
            ageCategory = "kids";
        } else if (age < 35) {
            ageCategory = "young-adult";
        } else if (age < 60) {
            ageCategory = "adult";
        } else {
            ageCategory = "senior";
        }

        const tags = eventTagMap[event.toLowerCase()] || [];

        // Build a filter to query actual gifts from the database
        const filter: IGiftFilter = {
            isAvailable: true,
            limit: 20,
            page: 1,
        };

        // Try matching by occasion first
        if (event) {
            filter.occasion = event.toLowerCase();
        }

        // Also match by tags if we have mapped ones
        if (tags.length > 0) {
            filter.tags = tags;
        }

        // Try matching by recipientType based on gender
        // We'll do a direct DB query for more flexible matching
        const query: Record<string, any> = {
            isDeleted: { $ne: true },
            isAvailable: { $ne: false },
        };

        // Match by occasion or tags
        const orConditions: Record<string, any>[] = [];
        if (event) {
            orConditions.push({ occasion: { $in: [event.toLowerCase()] } });
            // Also search by event name in tags, category, and name
            orConditions.push({ tags: { $in: [event.toLowerCase(), ...tags] } });
            orConditions.push({ category: { $regex: event, $options: "i" } });
            orConditions.push({ name: { $regex: event, $options: "i" } });
        }

        if (orConditions.length > 0) {
            query.$or = orConditions;
        }

        // Try to match gender with recipientType
        if (gender) {
            // Don't strictly filter by gender — just prefer matching ones
        }

        // Fetch gifts, preferring matches, falling back to all available gifts
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 20 : limit;
        const skip = (safePage - 1) * safeLimit;

        let gifts = await giftRepository.findWithQuery(query, safeLimit, skip);

        // If no gifts matched the filters, return all available gifts
        if (gifts.length === 0) {
            gifts = await giftRepository.findWithQuery(
                { isDeleted: { $ne: true }, isAvailable: { $ne: false } },
                safeLimit,
                skip
            );
        }

        return gifts;
    }

    async getAllGifts(): Promise<IGift[]> {
        return await giftRepository.getAll();
    }

    async getGiftById(id: string): Promise<IGift> {
        const gift = await giftRepository.getById(id);
        if (!gift) {
            throw new HttpError(404, "Gift not found");
        }
        return gift;
    }

    async createGift(giftData: createGiftDto): Promise<IGift> {
        return await giftRepository.create(giftData);
    }

    async updateGift(id: string, updateData: Partial<IGift>): Promise<IGift> {
        const updatedGift = await giftRepository.update(id, updateData);
        if (!updatedGift) {
            throw new HttpError(404, "Gift not found");
        }
        return updatedGift;
    }

    async deleteGift(id: string): Promise<void> {
        const deleted = await giftRepository.delete(id);
        if (!deleted) {
            throw new HttpError(404, "Gift not found");
        }
    }

    async softDeleteGift(id: string): Promise<IGift> {
        const gift = await giftRepository.softDelete(id);
        if (!gift) {
            throw new HttpError(404, "Gift not found");
        }
        return gift;
    }

    async restoreGift(id: string): Promise<IGift> {
        const gift = await giftRepository.restore(id);
        if (!gift) {
            throw new HttpError(404, "Gift not found");
        }
        return gift;
    }

    async filterGifts(filter: IGiftFilter): Promise<IPaginatedResult<IGift>> {
        return await giftRepository.filter(filter);
    }

    async getRecommendedGifts(tag?: string): Promise<IGift[]> {
        return await giftRepository.getRecommendations(tag);
    }

    async getGiftStats(): Promise<{ total: number; available: number }> {
        const total = await giftRepository.count();
        return { total, available: total };
    }
}

