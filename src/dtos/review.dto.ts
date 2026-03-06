import z from "zod";
import { CreateReviewSchema, UpdateReviewStatusSchema } from "../types/review.type";

export const createReviewDto = CreateReviewSchema;
export type createReviewDto = z.infer<typeof createReviewDto>;

export const updateReviewStatusDto = UpdateReviewStatusSchema;
export type updateReviewStatusDto = z.infer<typeof updateReviewStatusDto>;
