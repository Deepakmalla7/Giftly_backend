import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabaseTest } from "../../database/mongodb";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDatabaseTest(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

const validUser = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
};

// Helper to register a user and return the response body
async function registerUser(overrides: Record<string, any> = {}) {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, ...overrides });
    return res;
}

// ─── REGISTER ────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
    it("1. should register a new user successfully", async () => {
        const res = await registerUser();
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User created successfully");
        expect(res.body.token).toBeDefined();
        expect(res.body.newUser).toBeDefined();
        expect(res.body.newUser.email).toBe("john@example.com");
    });

    it("2. should return token on registration", async () => {
        const res = await registerUser();
        expect(res.status).toBe(201);
        expect(typeof res.body.token).toBe("string");
        expect(res.body.token.length).toBeGreaterThan(0);
    });

    it("3. should not include password in response", async () => {
        const res = await registerUser();
        expect(res.status).toBe(201);
        expect(res.body.newUser.password).toBeUndefined();
    });

    it("4. should fail with duplicate email", async () => {
        await registerUser();
        const res = await registerUser({ username: "different" });
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it("5. should fail with duplicate username", async () => {
        await registerUser();
        const res = await registerUser({ email: "other@example.com" });
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it("6. should fail when firstName is missing", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validUser, firstName: undefined });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("7. should fail when passwords do not match", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validUser, confirmPassword: "wrong" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("8. should fail with invalid email format", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validUser, email: "not-an-email" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// ─── LOGIN ───────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
    it("9. should login with valid credentials", async () => {
        await registerUser();
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "password123" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Login successful");
        expect(res.body.token).toBeDefined();
    });

    it("10. should return user data on login", async () => {
        await registerUser();
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "password123" });
        expect(res.body.newUser).toBeDefined();
        expect(res.body.newUser.email).toBe("john@example.com");
        expect(res.body.newUser.firstName).toBe("John");
    });

    it("11. should fail with wrong password", async () => {
        await registerUser();
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "wrongpass" });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it("12. should fail with non-existent email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "noone@example.com", password: "password123" });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("13. should fail with missing email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ password: "password123" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("14. should fail with missing password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// ─── LOGOUT ──────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
    it("15. should logout successfully", async () => {
        const res = await request(app).post("/api/auth/logout");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Logout successful");
    });
});

// ─── GET PROFILE ─────────────────────────────────────────────

describe("GET /api/auth/profile/:id", () => {
    it("16. should get user profile by id", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        const res = await request(app).get(`/api/auth/profile/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe("john@example.com");
        expect(res.body.data.firstName).toBe("John");
    });

    it("17. should return 404 for non-existent user id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/api/auth/profile/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("18. should return 500 for invalid id format", async () => {
        const res = await request(app).get("/api/auth/profile/invalid-id");
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it("19. should not return password in profile", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        const res = await request(app).get(`/api/auth/profile/${userId}`);
        expect(res.body.data.password).toBeUndefined();
    });
});

// ─── UPDATE PROFILE ──────────────────────────────────────────

describe("PUT /api/auth/:id", () => {
    it("20. should update user firstName", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        const res = await request(app)
            .put(`/api/auth/${userId}`)
            .send({ firstName: "Jane" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.firstName).toBe("Jane");
    });

    it("21. should update user lastName", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        const res = await request(app)
            .put(`/api/auth/${userId}`)
            .send({ lastName: "Smith" });
        expect(res.status).toBe(200);
        expect(res.body.data.lastName).toBe("Smith");
    });

    it("22. should update multiple fields at once", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        const res = await request(app)
            .put(`/api/auth/${userId}`)
            .send({ firstName: "Jane", age: 30, gender: "female" });
        expect(res.status).toBe(200);
        expect(res.body.data.firstName).toBe("Jane");
        expect(res.body.data.age).toBe(30);
        expect(res.body.data.gender).toBe("female");
    });

    it("23. should fail to update with duplicate email", async () => {
        await registerUser();
        const reg2 = await registerUser({
            email: "jane@example.com",
            username: "janedoe",
        });
        const userId2 = reg2.body.newUser.id;
        const res = await request(app)
            .put(`/api/auth/${userId2}`)
            .send({ email: "john@example.com" });
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    it("24. should fail to update with duplicate username", async () => {
        await registerUser();
        const reg2 = await registerUser({
            email: "jane@example.com",
            username: "janedoe",
        });
        const userId2 = reg2.body.newUser.id;
        const res = await request(app)
            .put(`/api/auth/${userId2}`)
            .send({ username: "johndoe" });
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
    });

    it("25. should return 404 for non-existent user", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .put(`/api/auth/${fakeId}`)
            .send({ firstName: "Ghost" });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ─── DELETE USER ─────────────────────────────────────────────

describe("DELETE /api/auth/:id", () => {
    it("26. should delete user successfully", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        const res = await request(app).delete(`/api/auth/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Account deleted successfully");
    });

    it("27. should return 404 when deleting non-existent user", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).delete(`/api/auth/${fakeId}`);
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it("28. should not find user after deletion", async () => {
        const reg = await registerUser();
        const userId = reg.body.newUser.id;
        await request(app).delete(`/api/auth/${userId}`);
        const res = await request(app).get(`/api/auth/profile/${userId}`);
        expect(res.status).toBe(404);
    });
});

// ─── FORGOT PASSWORD ─────────────────────────────────────────

describe("POST /api/auth/forgot-password", () => {
    it("29. should return 400 when email is missing", async () => {
        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("30. should return 400 for invalid email format", async () => {
        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "bad-email" });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// ─── TEST ROUTE ──────────────────────────────────────────────

describe("GET /api/auth/test", () => {
    it("should confirm auth route is working", async () => {
        const res = await request(app).get("/api/auth/test");
        expect(res.status).toBe(200);
        expect(res.text).toBe("User route working");
    });
});
