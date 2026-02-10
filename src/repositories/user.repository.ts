import { Iuser, UserModel, } from "../models/user_model";

export interface IUserRepository{
    createUser(userData:Partial<Iuser>):Promise<Iuser>;
    getUserByEmail(email:string):Promise<Iuser | null>;
    getUserByUsername(username:string):Promise<Iuser | null>;

    //5 common database operations can be added here
    getUserById(id:string):Promise<Iuser | null>;
    getAllUsers():Promise<Iuser[]>;
    updateUser(id:string,updateData:Partial<Iuser>):Promise<Iuser | null>;
    deleteUser(id:string):Promise<boolean>;

    loginUser(email:string,password:string):Promise<Iuser | null>;

    // Pagination & search
    getUsersPaginated(filter: Record<string, any>, page: number, limit: number, sort?: Record<string, any>): Promise<Iuser[]>;
    countUsers(filter: Record<string, any>): Promise<number>;
    softDeleteUser(id: string): Promise<Iuser | null>;
    restoreUser(id: string): Promise<Iuser | null>;
}

export class UserRepository implements IUserRepository{

    async loginUser(email: string, password: string): Promise<Iuser | null> {
      
        throw new Error("Method not implemented.");
    }

    async getUserById(id: string): Promise<Iuser | null> {
       const user = await UserModel.findById(id);
       return user;
    }
    async getAllUsers(): Promise<Iuser[]> {
        const users = await UserModel.find();
        return users;
    }

    /**
     * Get users with pagination, filtering, and sorting
     */
    async getUsersPaginated(
        filter: Record<string, any>,
        page: number = 1,
        limit: number = 10,
        sort: Record<string, any> = { createdAt: -1 }
    ): Promise<Iuser[]> {
        const skip = (page - 1) * limit;
        const users = await UserModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        return users;
    }

    /**
     * Count users matching a filter
     */
    async countUsers(filter: Record<string, any>): Promise<number> {
        return await UserModel.countDocuments(filter);
    }

    async updateUser(id: string, updateData: Partial<Iuser>): Promise<Iuser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate
        (id,
        updateData,{new:true});
        return updatedUser;
    }
    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;

    }

    /**
     * Soft delete user by setting accountStatus to 'inactive'
     */
    async softDeleteUser(id: string): Promise<Iuser | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { accountStatus: "inactive" },
            { new: true }
        );
    }

    /**
     * Restore a soft-deleted user by setting accountStatus to 'active'
     */
    async restoreUser(id: string): Promise<Iuser | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { accountStatus: "active" },
            { new: true }
        );
    }

    async createUser(userData: Partial<Iuser>): Promise<Iuser> {
        const user = new UserModel(userData);
        await user.save();
        return user;
    }
    async getUserByEmail(email: string): Promise<Iuser | null> {
        const user = await UserModel.findOne({email});
        return user;

    }

    /**
     * Find user by hashed reset password token
     */
    async getUserByResetToken(hashedToken: string): Promise<Iuser | null> {
        const user = await UserModel.findOne({ resetPasswordToken: hashedToken });
        return user;
    }

    async getUserByUsername(username: string): Promise<Iuser | null> {
        const user = await UserModel.findOne({username});
        return user;
    }
    

}

