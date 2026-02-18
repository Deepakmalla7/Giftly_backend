import z from "zod";
import { FavoriteItemSchema } from "../types/favorite.type";

export const addFavoriteDto = FavoriteItemSchema;
export type addFavoriteDto = z.infer<typeof addFavoriteDto>;
