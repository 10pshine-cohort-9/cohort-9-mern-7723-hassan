const request = require("supertest");
const app = require("../app");
const Note = require("../models/note");
const User = require("../models/user");

process.env.JWT_SECRET ||= "test-secret";

describe("Note save persistence", () => {
    let token;
    let user;

    beforeEach(async () => {
        await request(app)
            .post("/user/register")
            .send({
                username: "Alice",
                email: "alice@example.com",
                password: "Password@1",
            });

        const loginRes = await request(app)
            .post("/user/login")
            .send({
                email: "alice@example.com",
                password: "Password@1",
            });

        token = loginRes.body.token;

        user = await User.findOne({
            email: "alice@example.com",
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("preserves the existing note when persistence fails during overwrite", async () => {
        const existingNote = await Note.create({
            user: user._id,
            title: "notes",
            content: "original content",
        });

        jest.spyOn(existingNote, "save").mockRejectedValueOnce(
            new Error("db failed")
        );

        jest.spyOn(Note, "findOne").mockResolvedValueOnce(existingNote);

        const res = await request(app)
            .post("/note/save")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "notes",
                text: "new content",
                action: "overwrite",
            });

        expect(res.statusCode).toBe(500);

        const note = await Note.findById(existingNote._id);

        expect(note.content).toBe("original content");
    });

    it("does not create a new note when persistence fails for a new save", async () => {
        jest.spyOn(Note, "create").mockRejectedValueOnce(
            new Error("db failed")
        );

        const res = await request(app)
            .post("/note/save")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "new-file",
                text: "new content",
            });

        expect(res.statusCode).toBe(500);

        const note = await Note.findOne({
            user: user._id,
            title: "new-file",
        });

        expect(note).toBeNull();
    });
});