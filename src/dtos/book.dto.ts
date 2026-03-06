import { BookSchema } from "../types/book.type";
import z from 'zod';

export const CreateBookDTO = BookSchema.pick({
    id:true,
    title:true
})

export type CreateBookDTO = z.infer<typeof CreateBookDTO>;

