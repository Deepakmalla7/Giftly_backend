import { Request, Response } from "express";
import { GiftService } from "../services/gift.service";
import { HttpError } from "../errors/http-error";
import { createGiftDto, updateGiftDto } from "../dtos/gift.dto";
import z from "zod";
import mongoose from "mongoose";

const giftService = new GiftService();

const giftRecommendationSchema = z.object({
    age: z.preprocess(
        (value) => {
            if (typeof value === "string" && value.trim().length > 0) {
                return Number(value);
            }
            return value;
        },
        z.number().min(5, "Age must be at least 5").max(120, "Invalid age")
    ).optional(),
    ageGroup: z.preprocess(
        (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
        z.string().min(1).optional()
    ),
    event: z.preprocess(
        (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
        z.string().min(1, "Event is required")
    ),
    gender: z.preprocess(
        (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
        z.string().min(1, "Gender is required").refine(
            (val) => ["male", "female", "other", "unisex"].includes(val.toLowerCase()),
            { message: "Gender must be male, female, other, or unisex" }
        )
    )
});

const ageGroupToAge = (ageGroup?: string) => {
    if (!ageGroup) return undefined;
    const normalized = ageGroup.trim().toLowerCase();
    if (normalized === "kid" || normalized === "kids" || normalized === "child") return 10;
    if (normalized === "teen" || normalized === "teenager") return 16;
    if (normalized === "adult") return 30;
    if (normalized === "senior") return 65;
    return undefined;
};

const normalizeTags = (tags: string[] | undefined) => {
    if (!tags) return [];
    return tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
};

const normalizeCategory = (category: string | undefined) => {
    if (!category) return undefined;
    const trimmed = category.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : undefined;
};

const parseNumberQuery = (value: unknown) => {
    if (value === undefined || value === null || value === "") return undefined;
    const actualValue = Array.isArray(value) ? value[0] : value;
    const parsed = Number(actualValue);
    return Number.isNaN(parsed) ? NaN : parsed;
};

const toQueryString = (value: unknown) => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
        const first = value[0];
        return typeof first === "string" ? first : undefined;
    }
    return typeof value === "string" ? value : undefined;
};

export class GiftController {
    async getGiftRecommendations(req: Request, res: Response) {
        try {
            const parsedData = giftRecommendationSchema.safeParse(req.query);
            
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request parameters",
                    errors: z.prettifyError(parsedData.error)
                });
            }

            const ageFromGroup = ageGroupToAge(parsedData.data.ageGroup);
            const age = parsedData.data.age ?? ageFromGroup;

            if (!age) {
                return res.status(400).json({
                    success: false,
                    message: "Age or ageGroup is required"
                });
            }

            const page = parseNumberQuery(req.query.page) || 1;
            const limit = parseNumberQuery(req.query.limit) || 10;

            const recommendations = await giftService.getGiftRecommendations(
                age,
                parsedData.data.event,
                parsedData.data.gender,
                page,
                limit
            );

            return res.status(200).json({
                success: true,
                message: "Gift recommendations fetched successfully",
                data: recommendations
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async updateUserPreferences(req: Request, res: Response) {
        try {
            const { age, event, gender } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const parsedData = giftRecommendationSchema.safeParse({ age, event, gender });

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request parameters"
                });
            }

            // Here you would update the user preferences in the database
            // For now, returning success message
            return res.status(200).json({
                success: true,
                message: "User preferences updated successfully",
                data: {
                    age,
                    event,
                    gender
                }
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async getAllGifts(req: Request, res: Response) {
        try {
            const eventRaw = toQueryString(req.query.event);
            const genderRaw = toQueryString(req.query.gender);
            const minPriceValue = parseNumberQuery(req.query.minPrice);
            const maxPriceValue = parseNumberQuery(req.query.maxPrice);
            const page = parseNumberQuery(req.query.page) || 1;
            const limit = parseNumberQuery(req.query.limit) || 20;

            if (Number.isNaN(minPriceValue) || Number.isNaN(maxPriceValue)) {
                return res.status(400).json({
                    success: false,
                    message: "minPrice and maxPrice must be valid numbers"
                });
            }

            if (
                minPriceValue !== undefined &&
                maxPriceValue !== undefined &&
                minPriceValue > maxPriceValue
            ) {
                return res.status(400).json({
                    success: false,
                    message: "minPrice cannot be greater than maxPrice"
                });
            }

            const hasFilters =
                !!eventRaw ||
                !!genderRaw ||
                minPriceValue !== undefined ||
                maxPriceValue !== undefined;

            if (!hasFilters) {
                const gifts = await giftService.getAllGifts();
                return res.status(200).json({
                    success: true,
                    message: "Gifts fetched successfully",
                    data: gifts
                });
            }

            const result = await giftService.filterGifts({
                occasion: eventRaw ? eventRaw.trim().toLowerCase() : undefined,
                recipientType: genderRaw ? genderRaw.trim().toLowerCase() : undefined,
                minPrice: minPriceValue,
                maxPrice: maxPriceValue,
                page,
                limit
            });

            return res.status(200).json({
                success: true,
                message: "Filtered gifts fetched successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async getGiftById(req: Request, res: Response) {
        try {
            const giftId = req.params.id;
            if (!mongoose.isValidObjectId(giftId)) {
                return res.status(400).json({ success: false, message: "Invalid gift ID" });
            }

            const gift = await giftService.getGiftById(giftId);
            return res.status(200).json({
                success: true,
                message: "Gift fetched successfully",
                data: gift
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async createGift(req: Request, res: Response) {
        try {
            // If file uploaded via multer, get the URL
            const imageUrl = req.file
                ? `/uploads/${req.file.filename}`
                : req.body.imageUrl || undefined;

            const bodyData = {
                ...req.body,
                price: req.body.price !== undefined ? Number(req.body.price) : undefined,
                stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
                rating: req.body.rating !== undefined ? Number(req.body.rating) : undefined,
                popularityScore: req.body.popularityScore !== undefined ? Number(req.body.popularityScore) : undefined,
                tags: typeof req.body.tags === "string" ? req.body.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : req.body.tags,
                occasion: typeof req.body.occasion === "string" ? req.body.occasion.split(",").map((t: string) => t.trim()).filter(Boolean) : req.body.occasion,
                interests: typeof req.body.interests === "string" ? req.body.interests.split(",").map((t: string) => t.trim()).filter(Boolean) : req.body.interests,
                isAvailable: req.body.isAvailable === "true" || req.body.isAvailable === true,
                imageUrl
            };

            const parsedData = createGiftDto.safeParse(bodyData);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: z.prettifyError(parsedData.error)
                });
            }

            const normalizedCategory = normalizeCategory(parsedData.data.category);
            const normalizedTags = normalizeTags(parsedData.data.tags);

            const newGift = await giftService.createGift({
                ...parsedData.data,
                category: normalizedCategory || parsedData.data.category,
                tags: normalizedTags
            });

            return res.status(201).json({
                success: true,
                message: "Gift created successfully",
                data: newGift
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async updateGift(req: Request, res: Response) {
        try {
            const giftId = req.params.id;
            if (!mongoose.isValidObjectId(giftId)) {
                return res.status(400).json({ success: false, message: "Invalid gift ID" });
            }

            // If file uploaded via multer, get the URL
            const imageUrl = req.file
                ? `/uploads/${req.file.filename}`
                : req.body.imageUrl;

            const bodyData: Record<string, any> = { ...req.body };
            if (imageUrl !== undefined) bodyData.imageUrl = imageUrl;
            if (bodyData.price !== undefined) bodyData.price = Number(bodyData.price);
            if (bodyData.stock !== undefined) bodyData.stock = Number(bodyData.stock);
            if (bodyData.rating !== undefined) bodyData.rating = Number(bodyData.rating);
            if (bodyData.popularityScore !== undefined) bodyData.popularityScore = Number(bodyData.popularityScore);
            if (typeof bodyData.tags === "string") bodyData.tags = bodyData.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
            if (typeof bodyData.occasion === "string") bodyData.occasion = bodyData.occasion.split(",").map((t: string) => t.trim()).filter(Boolean);
            if (typeof bodyData.interests === "string") bodyData.interests = bodyData.interests.split(",").map((t: string) => t.trim()).filter(Boolean);
            if (bodyData.isAvailable !== undefined) bodyData.isAvailable = bodyData.isAvailable === "true" || bodyData.isAvailable === true;

            const parsedData = updateGiftDto.safeParse(bodyData);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: z.prettifyError(parsedData.error)
                });
            }

            if (Object.keys(parsedData.data).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Update data is required"
                });
            }

            const updateData = { ...parsedData.data } as any;

            if (updateData.category) {
                updateData.category = normalizeCategory(updateData.category) || updateData.category;
            }

            if (updateData.tags) {
                updateData.tags = normalizeTags(updateData.tags);
            }

            const updatedGift = await giftService.updateGift(giftId, updateData);
            return res.status(200).json({
                success: true,
                message: "Gift updated successfully",
                data: updatedGift
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async deleteGift(req: Request, res: Response) {
        try {
            const giftId = req.params.id;
            if (!mongoose.isValidObjectId(giftId)) {
                return res.status(400).json({ success: false, message: "Invalid gift ID" });
            }

            // Soft delete by default
            const gift = await giftService.softDeleteGift(giftId);
            return res.status(200).json({
                success: true,
                message: "Gift deleted successfully",
                data: gift
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async permanentDeleteGift(req: Request, res: Response) {
        try {
            const giftId = req.params.id;
            if (!mongoose.isValidObjectId(giftId)) {
                return res.status(400).json({ success: false, message: "Invalid gift ID" });
            }

            await giftService.deleteGift(giftId);
            return res.status(200).json({
                success: true,
                message: "Gift permanently deleted"
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async restoreGift(req: Request, res: Response) {
        try {
            const giftId = req.params.id;
            if (!mongoose.isValidObjectId(giftId)) {
                return res.status(400).json({ success: false, message: "Invalid gift ID" });
            }

            const gift = await giftService.restoreGift(giftId);
            return res.status(200).json({
                success: true,
                message: "Gift restored successfully",
                data: gift
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async getGiftStats(req: Request, res: Response) {
        try {
            const stats = await giftService.getGiftStats();
            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async filterGifts(req: Request, res: Response) {
        try {
            const categoryRaw = toQueryString(req.query.category);
            const tagsRaw = toQueryString(req.query.tags);
            const eventRaw = toQueryString(req.query.event);
            const genderRaw = toQueryString(req.query.gender);
            const minPriceValue = parseNumberQuery(req.query.minPrice);
            const maxPriceValue = parseNumberQuery(req.query.maxPrice);
            const search = toQueryString(req.query.search);
            const occasion = toQueryString(req.query.occasion) || eventRaw;
            const isAvailableRaw = toQueryString(req.query.isAvailable);
            const page = parseNumberQuery(req.query.page) || 1;
            const limit = parseNumberQuery(req.query.limit) || 10;

            if (Number.isNaN(minPriceValue) || Number.isNaN(maxPriceValue)) {
                return res.status(400).json({
                    success: false,
                    message: "minPrice and maxPrice must be valid numbers"
                });
            }

            if (
                minPriceValue !== undefined &&
                maxPriceValue !== undefined &&
                minPriceValue > maxPriceValue
            ) {
                return res.status(400).json({
                    success: false,
                    message: "minPrice cannot be greater than maxPrice"
                });
            }

            const tags = tagsRaw
                ? normalizeTags(tagsRaw.split(","))
                : undefined;

            const isAvailable = isAvailableRaw === "true" ? true : isAvailableRaw === "false" ? false : undefined;

            const result = await giftService.filterGifts({
                category: normalizeCategory(categoryRaw),
                minPrice: minPriceValue,
                maxPrice: maxPriceValue,
                tags,
                search: search || undefined,
                occasion: occasion ? occasion.trim().toLowerCase() : undefined,
                recipientType: genderRaw ? genderRaw.trim().toLowerCase() : undefined,
                isAvailable,
                page,
                limit
            });

            return res.status(200).json({
                success: true,
                message: "Filtered gifts fetched successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages
                }
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async getRecommendedGifts(req: Request, res: Response) {
        try {
            const tagRaw = toQueryString(req.query.tag);
            const tag = tagRaw ? tagRaw.trim().toLowerCase() : undefined;

            const gifts = await giftService.getRecommendedGifts(tag || undefined);
            return res.status(200).json({
                success: true,
                message: "Recommended gifts fetched successfully",
                data: gifts
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }
}
