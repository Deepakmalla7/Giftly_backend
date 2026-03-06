import { GiftModel, IGift } from "../models/gift.model";

export interface IGiftFilter {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    occasion?: string;
    recipientType?: string;
    isAvailable?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface IPaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IGiftRepository {
    getAll(): Promise<IGift[]>;
    getById(id: string): Promise<IGift | null>;
    create(giftData: Partial<IGift>): Promise<IGift>;
    createMany(gifts: Partial<IGift>[]): Promise<IGift[]>;
    update(id: string, updateData: Partial<IGift>): Promise<IGift | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<IGift | null>;
    restore(id: string): Promise<IGift | null>;
    count(): Promise<number>;
    filter(filter: IGiftFilter): Promise<IPaginatedResult<IGift>>;
    getRecommendations(tag?: string): Promise<IGift[]>;
    findWithQuery(query: Record<string, any>, limit?: number, skip?: number): Promise<IGift[]>;
}

export class GiftRepository implements IGiftRepository {
    async getAll(): Promise<IGift[]> {
        return GiftModel.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    }

    async getById(id: string): Promise<IGift | null> {
        return GiftModel.findById(id);
    }

    async create(giftData: Partial<IGift>): Promise<IGift> {
        const gift = new GiftModel(giftData);
        await gift.save();
        return gift;
    }

    async createMany(gifts: Partial<IGift>[]): Promise<IGift[]> {
        return GiftModel.insertMany(gifts) as unknown as IGift[];
    }

    async update(id: string, updateData: Partial<IGift>): Promise<IGift | null> {
        return GiftModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await GiftModel.findByIdAndDelete(id);
        return result ? true : false;
    }

    async softDelete(id: string): Promise<IGift | null> {
        return GiftModel.findByIdAndUpdate(id, { isDeleted: true, isAvailable: false }, { new: true });
    }

    async restore(id: string): Promise<IGift | null> {
        return GiftModel.findByIdAndUpdate(id, { isDeleted: false, isAvailable: true }, { new: true });
    }

    async count(): Promise<number> {
        return GiftModel.countDocuments({ isDeleted: { $ne: true } });
    }

    async filter(filter: IGiftFilter): Promise<IPaginatedResult<IGift>> {
        const query: Record<string, any> = { isDeleted: { $ne: true } };
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const skip = (page - 1) * limit;

        if (filter.category) {
            query.category = filter.category;
        }

        if (filter.tags && filter.tags.length > 0) {
            query.tags = { $in: filter.tags };
        }

        if (filter.occasion) {
            query.occasion = { $in: [filter.occasion] };
        }

        if (filter.recipientType) {
            query.recipientType = { $in: [filter.recipientType, "unisex"] };
        }

        if (filter.isAvailable !== undefined) {
            query.isAvailable = filter.isAvailable;
        }

        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
            query.price = {};
            if (filter.minPrice !== undefined) {
                query.price.$gte = filter.minPrice;
            }
            if (filter.maxPrice !== undefined) {
                query.price.$lte = filter.maxPrice;
            }
        }

        if (filter.search) {
            query.$or = [
                { name: { $regex: filter.search, $options: "i" } },
                { description: { $regex: filter.search, $options: "i" } },
                { category: { $regex: filter.search, $options: "i" } }
            ];
        }

        const [data, total] = await Promise.all([
            GiftModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            GiftModel.countDocuments(query)
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getRecommendations(tag?: string): Promise<IGift[]> {
        const query: Record<string, any> = { isDeleted: { $ne: true } };
        if (tag) {
            query.tags = { $in: [tag] };
        }

        return GiftModel.find(query).sort({ popularityScore: -1, createdAt: -1 }).limit(10);
    }

    async findWithQuery(query: Record<string, any>, limit: number = 20, skip: number = 0): Promise<IGift[]> {
        return GiftModel.find(query)
            .sort({ popularityScore: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
}
