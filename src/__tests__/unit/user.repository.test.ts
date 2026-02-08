import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserRepository } from "../../repositories/user.repository";
import { UserModel } from "../../models/user_model";

let mongoServer: MongoMemoryServer;
let userRepo: UserRepository;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    userRepo = new UserRepository();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await UserModel.deleteMany({});
});

const baseUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "hashed123",
    username: "johndoe",
};

// ─── createUser ─────────────────────────────────────────────────

describe("createUser", () => {
    it("1. should create a user and return it", async () => {
        const user = await userRepo.createUser(baseUser);
        expect(user._id).toBeDefined();
        expect(user.firstName).toBe("John");
        expect(user.email).toBe("john@example.com");
    });

    it("2. should set default role to 'user'", async () => {
        const user = await userRepo.createUser(baseUser);
        expect(user.role).toBe("user");
    });

    it("3. should set default accountStatus to 'active'", async () => {
        const user = await userRepo.createUser(baseUser);
        expect(user.accountStatus).toBe("active");
    });

    it("4. should create a user with admin role", async () => {
        const user = await userRepo.createUser({ ...baseUser, role: "admin" });
        expect(user.role).toBe("admin");
    });

    it("5. should include timestamps (createdAt, updatedAt)", async () => {
        const user = await userRepo.createUser(baseUser);
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
    });

    it("6. should reject duplicate email", async () => {
        await userRepo.createUser(baseUser);
        await expect(
            userRepo.createUser({ ...baseUser, username: "other" })
        ).rejects.toThrow();
    });

    it("7. should reject duplicate username", async () => {
        await userRepo.createUser(baseUser);
        await expect(
            userRepo.createUser({ ...baseUser, email: "other@example.com" })
        ).rejects.toThrow();
    });

    it("8. should allow optional fields (age, gender, event)", async () => {
        const user = await userRepo.createUser({
            ...baseUser,
            age: 25,
            gender: "male",
            event: "birthday",
        });
        expect(user.age).toBe(25);
        expect(user.gender).toBe("male");
        expect(user.event).toBe("birthday");
    });
});

// ─── getUserByEmail ─────────────────────────────────────────────

describe("getUserByEmail", () => {
    it("9. should find user by email", async () => {
        await userRepo.createUser(baseUser);
        const found = await userRepo.getUserByEmail("john@example.com");
        expect(found).not.toBeNull();
        expect(found!.email).toBe("john@example.com");
    });

    it("10. should return null for non-existent email", async () => {
        const found = await userRepo.getUserByEmail("nobody@example.com");
        expect(found).toBeNull();
    });
});

// ─── getUserByUsername ──────────────────────────────────────────

describe("getUserByUsername", () => {
    it("11. should find user by username", async () => {
        await userRepo.createUser(baseUser);
        const found = await userRepo.getUserByUsername("johndoe");
        expect(found).not.toBeNull();
        expect(found!.username).toBe("johndoe");
    });

    it("12. should return null for non-existent username", async () => {
        const found = await userRepo.getUserByUsername("ghost");
        expect(found).toBeNull();
    });
});

// ─── getUserById ───────────────────────────────────────────────

describe("getUserById", () => {
    it("13. should find user by id", async () => {
        const created = await userRepo.createUser(baseUser);
        const found = await userRepo.getUserById(created._id.toString());
        expect(found).not.toBeNull();
        expect(found!.firstName).toBe("John");
    });

    it("14. should return null for non-existent id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const found = await userRepo.getUserById(fakeId);
        expect(found).toBeNull();
    });
});

// ─── getAllUsers ────────────────────────────────────────────────

describe("getAllUsers", () => {
    it("15. should return empty array when no users", async () => {
        const users = await userRepo.getAllUsers();
        expect(users).toEqual([]);
    });

    it("16. should return all users", async () => {
        await userRepo.createUser(baseUser);
        await userRepo.createUser({
            ...baseUser,
            email: "jane@example.com",
            username: "janedoe",
        });
        const users = await userRepo.getAllUsers();
        expect(users).toHaveLength(2);
    });
});

// ─── updateUser ────────────────────────────────────────────────

describe("updateUser", () => {
    it("17. should update firstName", async () => {
        const user = await userRepo.createUser(baseUser);
        const updated = await userRepo.updateUser(user._id.toString(), {
            firstName: "Jane",
        });
        expect(updated).not.toBeNull();
        expect(updated!.firstName).toBe("Jane");
    });

    it("18. should update multiple fields", async () => {
        const user = await userRepo.createUser(baseUser);
        const updated = await userRepo.updateUser(user._id.toString(), {
            firstName: "Jane",
            lastName: "Smith",
            age: 30,
        });
        expect(updated!.firstName).toBe("Jane");
        expect(updated!.lastName).toBe("Smith");
        expect(updated!.age).toBe(30);
    });

    it("19. should return the updated document (new: true)", async () => {
        const user = await userRepo.createUser(baseUser);
        const updated = await userRepo.updateUser(user._id.toString(), {
            firstName: "Updated",
        });
        expect(updated!.firstName).toBe("Updated");
    });

    it("20. should return null for non-existent id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const updated = await userRepo.updateUser(fakeId, { firstName: "X" });
        expect(updated).toBeNull();
    });
});

// ─── deleteUser ────────────────────────────────────────────────

describe("deleteUser", () => {
    it("21. should delete a user and return true", async () => {
        const user = await userRepo.createUser(baseUser);
        const result = await userRepo.deleteUser(user._id.toString());
        expect(result).toBe(true);
        const found = await userRepo.getUserById(user._id.toString());
        expect(found).toBeNull();
    });

    it("22. should return false for non-existent id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const result = await userRepo.deleteUser(fakeId);
        expect(result).toBe(false);
    });
});

// ─── softDeleteUser ────────────────────────────────────────────

describe("softDeleteUser", () => {
    it("23. should set accountStatus to 'inactive'", async () => {
        const user = await userRepo.createUser(baseUser);
        const soft = await userRepo.softDeleteUser(user._id.toString());
        expect(soft).not.toBeNull();
        expect(soft!.accountStatus).toBe("inactive");
    });

    it("24. should return null for non-existent id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const soft = await userRepo.softDeleteUser(fakeId);
        expect(soft).toBeNull();
    });
});

// ─── restoreUser ───────────────────────────────────────────────

describe("restoreUser", () => {
    it("25. should set accountStatus back to 'active'", async () => {
        const user = await userRepo.createUser(baseUser);
        await userRepo.softDeleteUser(user._id.toString());
        const restored = await userRepo.restoreUser(user._id.toString());
        expect(restored).not.toBeNull();
        expect(restored!.accountStatus).toBe("active");
    });

    it("26. should return null for non-existent id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const restored = await userRepo.restoreUser(fakeId);
        expect(restored).toBeNull();
    });
});

// ─── getUsersPaginated ─────────────────────────────────────────

describe("getUsersPaginated", () => {
    beforeEach(async () => {
        for (let i = 1; i <= 5; i++) {
            await userRepo.createUser({
                ...baseUser,
                email: `user${i}@example.com`,
                username: `user${i}`,
                firstName: `User${i}`,
            });
        }
    });

    it("27. should return paginated results (page 1, limit 2)", async () => {
        const users = await userRepo.getUsersPaginated({}, 1, 2);
        expect(users).toHaveLength(2);
    });

    it("28. should return paginated results (page 2, limit 2)", async () => {
        const users = await userRepo.getUsersPaginated({}, 2, 2);
        expect(users).toHaveLength(2);
    });

    it("29. should return remaining items on last page", async () => {
        const users = await userRepo.getUsersPaginated({}, 3, 2);
        expect(users).toHaveLength(1);
    });
});

// ─── countUsers ────────────────────────────────────────────────

describe("countUsers", () => {
    it("30. should return correct count", async () => {
        await userRepo.createUser(baseUser);
        await userRepo.createUser({
            ...baseUser,
            email: "jane@example.com",
            username: "janedoe",
        });
        const count = await userRepo.countUsers({});
        expect(count).toBe(2);
    });
});

// ─── getUserByResetToken ───────────────────────────────────────

describe("getUserByResetToken", () => {
    it("should find user by reset token", async () => {
        const user = await userRepo.createUser(baseUser);
        await userRepo.updateUser(user._id.toString(), {
            resetPasswordToken: "hashed-token-abc",
            resetPasswordExpires: new Date(Date.now() + 3600000),
        });
        const found = await userRepo.getUserByResetToken("hashed-token-abc");
        expect(found).not.toBeNull();
        expect(found!.email).toBe("john@example.com");
    });

    it("should return null for non-existent token", async () => {
        const found = await userRepo.getUserByResetToken("no-such-token");
        expect(found).toBeNull();
    });
});

// ─── loginUser ─────────────────────────────────────────────────

describe("loginUser", () => {
    it("should throw 'Method not implemented'", async () => {
        await expect(
            userRepo.loginUser("john@example.com", "pass")
        ).rejects.toThrow("Method not implemented.");
    });
});
