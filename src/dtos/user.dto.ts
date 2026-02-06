import z from "zod";
import { UserSchema } from "../types/user.type";

export const createUserDto = UserSchema.pick(
    {
        firstName: true,
        lastName:true,
        username:true,
        email:true,
        password:true
    }
).extend(
    {
        confirmPassword:z.string().min(3)
    }
).refine(
    (data) => data.password === data.confirmPassword,
    {
        message:"Password do not match",
        path:["confirmPassword"]
    }
)

export type createUserDto = z.infer<typeof createUserDto>;


export const updateUserDto = UserSchema.partial().extend(
    {
        confirmPassword:z.string().min(3).optional()
    }
).refine(
    (data) => {
        if(data.password || data.confirmPassword){
            return data.password === data.confirmPassword;
        }
        return true;
    },
    {
        message:"Password do not match",
    }
)

export type updateUserDto = z.infer<typeof updateUserDto>;


//if anything is sent from client then we need to have a dto to validate that data

export const loginUserDto = z.object(
    {
        email:z.string().min(1,"Email is required").email("Invalid email format"),
        password:z.string().min(3,"Password must be at least 3 characters long")
    }
)

export type loginUserDto = z.infer<typeof loginUserDto>;