const request = require("supertest");
const { expect } = require("chai");
const app = require("../app");
const jwt = require("jsonwebtoken");

describe("Registration", () => {
    it("should reject weak passwords", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "ahmed@test.com", password: "12345" });

        expect(res.statusCode).to.equal(400);
    });

    it("should not allow duplicate registration", async () => {
        await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "ahmed@test.com", password: "Password@1" });

        const res = await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "ahmed@test.com", password: "Password@1" });

        expect(res.statusCode).to.equal(409);
        expect(res.body.message).to.equal("User already exists");
    });

    it("should reject invalid credentials", async () => {
        await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "ahmed@test.com", password: "Password@1" });

        const res = await request(app)
            .post("/user/login")
            .send({ email: "ahmed@test.com", password: "WrongPassword@1" });

        expect(res.statusCode).to.equal(401);
        expect(res.body.message).to.equal("Invalid password");
    });

    it("should login successfully and return a JWT token", async () => {
        await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "ahmed@example.com", password: "Password@1" });

        const res = await request(app)
            .post("/user/login")
            .send({ email: "ahmed@example.com", password: "Password@1" });

        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.message).to.equal("User logged in successfully");
        expect(res.body.token).to.exist;
        expect(res.body.user.email).to.equal("ahmed@example.com");
        expect(res.body.user.username).to.equal("Ahmed");
    });

    it("should reject malformed JWT token", async () => {
        const res = await request(app)
            .get("/user/profile")
            .set("Authorization", "Bearer invalid.token");

        expect(res.statusCode).to.equal(401);
    });

    it("should reject expired JWT token", async () => {
        const expiredToken = jwt.sign(
            { id: "507f1f77bcf86cd799439011", email: "expired@test.com" },
            process.env.JWT_SECRET,
            { expiresIn: "-1s" }
        );

        const res = await request(app)
            .get("/user/profile")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(res.statusCode).to.equal(401);
    });

    it("should return profile without exposing the password", async () => {
        await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "profile@test.com", password: "Password@1" });

        const loginRes = await request(app)
            .post("/user/login")
            .send({ email: "profile@test.com", password: "Password@1" });

        const token = loginRes.body.token;

        const profileRes = await request(app)
            .get("/user/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(profileRes.statusCode).to.equal(200);
        expect(profileRes.body.success).to.equal(true);
        expect(profileRes.body.user.email).to.equal("profile@test.com");
        expect(profileRes.body.user.username).to.equal("Ahmed");
        expect(profileRes.body.user.password).to.be.undefined;
    });
});