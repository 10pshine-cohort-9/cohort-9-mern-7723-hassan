const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");
const app = require("../app");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

describe("Registration - additional coverage", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("should reject registration with missing fields", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({ email: "missing@test.com", password: "Password@1" });

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Username, email and password are required");
    });

    it("should reject a non-string username (NoSQL injection attempt)", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({ username: { $ne: null }, email: "inject@test.com", password: "Password@1" });

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Invalid input format");
    });

    it("should reject a non-string email (NoSQL injection attempt)", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: { $gt: "" }, password: "Password@1" });

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Invalid input format");
    });

    it("should handle a race-condition duplicate key error from the database", async () => {
        sinon.stub(User, "findOne").resolves(null);
        sinon.stub(User.prototype, "save").rejects({ code: 11000 });

        const res = await request(app)
            .post("/user/register")
            .send({ username: "Race", email: "race@test.com", password: "Password@1" });

        expect(res.statusCode).to.equal(409);
        expect(res.body.message).to.equal("User already exists");
    });

    it("should pass unexpected database errors to the error handler", async () => {
        sinon.stub(User, "findOne").rejects(new Error("db down"));

        const res = await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "dbdown@test.com", password: "Password@1" });

        expect(res.statusCode).to.equal(500);
    });
});

describe("Login - additional coverage", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("should reject login with missing fields", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({ email: "someone@test.com" });

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Email and password are required");
    });

    it("should reject a non-string email on login (NoSQL injection attempt)", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({ email: { $gt: "" }, password: "anything" });

        expect(res.statusCode).to.equal(400);
        expect(res.body.message).to.equal("Invalid email or password format");
    });

    it("should pass unexpected database errors to the error handler", async () => {
        await request(app)
            .post("/user/register")
            .send({ username: "Ahmed", email: "loginerr@test.com", password: "Password@1" });

        sinon.stub(User, "findOne").rejects(new Error("db down"));

        const res = await request(app)
            .post("/user/login")
            .send({ email: "loginerr@test.com", password: "Password@1" });

        expect(res.statusCode).to.equal(500);
    });
});

describe("Profile - additional coverage", () => {
    it("should reject a request with no token at all", async () => {
        const res = await request(app).get("/user/profile");
        expect(res.statusCode).to.equal(401);
    });
});

describe("Test route", () => {
    it("should respond with a plain confirmation message", async () => {
        const res = await request(app).get("/user/test");

        expect(res.statusCode).to.equal(200);
        expect(res.text).to.equal("Test route works");
    });
});