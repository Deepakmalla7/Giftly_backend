import {z} from 'zod';
import {userType} from "../types/user.type";
import {Iuser} from "../models/user_model";

export interface UserRepositoryINterface{
    createUser(user:userType): Promise<Iuser>;
    getUsers():Promise<Iuser[]>;
}