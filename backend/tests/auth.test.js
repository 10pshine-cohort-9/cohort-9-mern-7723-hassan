const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
describe("Registration", () => {
    it("should reject weak passwords", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({
                username: "Ahmed",
                email: "ahmed@test.com",
                password: "12345"
            });

        expect(res.statusCode).toBe(400);
    });
    it("should not allow duplicate registration", async () => {
        // First registration
        await request(app)
            .post("/user/register")
            .send({
                username: "Ahmed",
                email: "ahmed@test.com",
                password: "Password@1"
            });

        // Second registration
        const res = await request(app)
            .post("/user/register")
            .send({
                username: "Ahmed",
                email: "ahmed@test.com",
                password: "Password@1"
            });

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("User already exists");
    });
    it("should reject invalid credentials", async () => {
        // Register a user first
        await request(app)
            .post("/user/register")
            .send({
                username: "Ahmed",
                email: "ahmed@test.com",
                password: "Password@1"
            });

        // Try logging in with the wrong password
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "ahmed@test.com",
                password: "WrongPassword@1"
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid password");
    });
    it("should login successfully and return a JWT token", async () => {
        // Register a user
        await request(app)
            .post("/user/register")
            .send({
                username: "Ahmed",
                email: "ahmed@example.com",
                password: "Password@1"
            });

        // Login
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "ahmed@example.com",
                password: "Password@1"
            });

        console.log(res.statusCode);
        console.log(res.body);

        expect(res.statusCode).toBe(200);

        expect(res.body.success).toBe(true);

        expect(res.body.message).toBe("User logged in successfully");

        expect(res.body.token).toBeDefined();

        expect(res.body.user.email).toBe("ahmed@example.com");

        expect(res.body.user.username).toBe("Ahmed");
    });
    it("should reject malformed JWT token", async () => {
        const res = await request(app)
            .get("/user/profile")
            .set("Authorization", "Bearer invalid.token");

        expect(res.statusCode).toBe(401);
    });
    it("should reject expired JWT token", async () => {
        const expiredToken = jwt.sign(
            {
                id: "507f1f77bcf86cd799439011",
                email: "expired@test.com"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "-1s"
            }
        );

        const res = await request(app)
            .get("/user/profile")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(res.statusCode).toBe(401);
    }); it("should return profile without exposing the password", async () => {
        // Register a user
        await request(app)
            .post("/user/register")
            .send({
                username: "Ahmed",
                email: "profile@test.com",
                password: "Password@1"
            });

        // Login to get JWT
        const loginRes = await request(app)
            .post("/user/login")
            .send({
                email: "profile@test.com",
                password: "Password@1"
            });

        const token = loginRes.body.token;

        // Fetch profile
        const profileRes = await request(app)
            .get("/user/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(profileRes.statusCode).toBe(200);

        expect(profileRes.body.success).toBe(true);

        expect(profileRes.body.user.email).toBe("profile@test.com");

        expect(profileRes.body.user.username).toBe("Ahmed");

        // Password should never be returned
        expect(profileRes.body.user.password).toBeUndefined();
    });

});