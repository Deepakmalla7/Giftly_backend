import z from "zod";
import { GiftSchema } from "../types/gift.type";

export const createGiftDto = GiftSchema;
export type createGiftDto = z.infer<typeof createGiftDto>;

export const updateGiftDto = GiftSchema.partial();
export type updateGiftDto = z.infer<typeof updateGiftDto>;
