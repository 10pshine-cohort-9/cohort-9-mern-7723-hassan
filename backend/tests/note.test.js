const request = require("supertest");
const { expect } = require("chai");
const sinon = require("sinon");
const app = require("../app");
const Note = require("../models/note");
const User = require("../models/user");


describe("Note routes", () => {
    let token;
    let user;

    beforeEach(async () => {
        await request(app)
            .post("/user/register")
            .send({ username: "Alice", email: "alice@example.com", password: "Password@1" });

        const loginRes = await request(app)
            .post("/user/login")
            .send({ email: "alice@example.com", password: "Password@1" });

        token = loginRes.body.token;
        user = await User.findOne({ email: "alice@example.com" });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("POST /note/save - create", () => {
        it("creates a new note and returns its id and name", async () => {
            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "my-first-note", text: "hello world" });

            expect(res.statusCode).to.equal(200);
            expect(res.body.success).to.equal(true);
            expect(res.body.note.name).to.equal("my-first-note");
            expect(res.body.note._id).to.exist;

            const saved = await Note.findById(res.body.note._id);
            expect(saved.content).to.equal("hello world");
            expect(saved.user.toString()).to.equal(user._id.toString());
        });

        it("rejects a save with no name", async () => {
            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ text: "hello world" });

            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("Name and text are required");
        });

        it("rejects a save with no text", async () => {
            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "no-text" });

            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("Name and text are required");
        });

        it("rejects an unauthenticated save request", async () => {
            const res = await request(app)
                .post("/note/save")
                .send({ name: "no-auth", text: "hello world" });

            expect(res.statusCode).to.equal(401);
        });
    });

    describe("POST /note/save - overwrite", () => {
        it("asks for an action when the title already exists and none is given", async () => {
            await Note.create({ user: user._id, title: "notes", content: "original" });

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "notes", text: "attempted new content" });

            expect(res.statusCode).to.equal(409);
            expect(res.body.requiresAction).to.equal(true);
            expect(res.body.options).to.include.members(["overwrite", "rename"]);
        });

        it("overwrites the existing note content when action is overwrite", async () => {
            const existingNote = await Note.create({
                user: user._id,
                title: "notes",
                content: "original",
            });

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "notes", text: "updated content", action: "overwrite" });

            expect(res.statusCode).to.equal(200);
            expect(res.body.note._id).to.equal(existingNote._id.toString());

            const updated = await Note.findById(existingNote._id);
            expect(updated.content).to.equal("updated content");
        });

        it("rejects an invalid action value", async () => {
            await Note.create({ user: user._id, title: "notes", content: "original" });

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "notes", text: "updated content", action: "delete-everything" });

            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("Invalid action.");
        });

        it("preserves the existing note when persistence fails during overwrite", async () => {
            const existingNote = await Note.create({
                user: user._id,
                title: "notes",
                content: "original content",
            });

            sinon.stub(existingNote, "save").rejects(new Error("db failed"));
            sinon.stub(Note, "findOne").resolves(existingNote);

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "notes", text: "new content", action: "overwrite" });

            expect(res.statusCode).to.equal(500);

            sinon.restore();
            const note = await Note.findById(existingNote._id);
            expect(note.content).to.equal("original content");
        });

        it("does not create a new note when persistence fails for a new save", async () => {
            sinon.stub(Note, "create").rejects(new Error("db failed"));

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "new-file", text: "new content" });

            expect(res.statusCode).to.equal(500);

            sinon.restore();
            const note = await Note.findOne({ user: user._id, title: "new-file" });
            expect(note).to.be.null;
        });
    });

    describe("POST /note/save - rename", () => {
        it("renames the existing note in place instead of creating a duplicate", async () => {
            const existingNote = await Note.create({
                user: user._id,
                title: "old-name",
                content: "some content",
            });

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "old-name",
                    text: "some content",
                    action: "rename",
                    newName: "new-name",
                });

            expect(res.statusCode).to.equal(200);
            expect(res.body.note._id).to.equal(existingNote._id.toString());
            expect(res.body.note.name).to.equal("new-name");

            const allNotes = await Note.find({ user: user._id });
            expect(allNotes.length).to.equal(1);
            expect(allNotes[0].title).to.equal("new-name");
        });

        it("rejects a rename with no newName provided", async () => {
            await Note.create({ user: user._id, title: "old-name", content: "some content" });

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "old-name", text: "some content", action: "rename" });

            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("New filename is required.");
        });

        it("rejects a rename when the new name is already taken", async () => {
            await Note.create({ user: user._id, title: "old-name", content: "content A" });
            await Note.create({ user: user._id, title: "taken-name", content: "content B" });

            const res = await request(app)
                .post("/note/save")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "old-name",
                    text: "content A",
                    action: "rename",
                    newName: "taken-name",
                });

            expect(res.statusCode).to.equal(409);
            expect(res.body.requiresAction).to.equal(true);
        });
    });

    describe("GET /note/files", () => {
        it("returns the authenticated user's notes sorted by most recently updated", async () => {
            await Note.collection.insertMany([
                { user: user._id, title: "first", content: "a", updatedAt: new Date("2024-01-01T00:00:00.000Z") },
                { user: user._id, title: "second", content: "b", updatedAt: new Date("2024-01-02T00:00:00.000Z") },
            ]);

            const res = await request(app)
                .get("/note/files")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body.files).to.have.lengthOf(2);
            expect(res.body.files[0].name).to.equal("second");
        });

        it("returns an empty list when the user has no notes", async () => {
            const res = await request(app)
                .get("/note/files")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body.files).to.have.lengthOf(0);
        });


        it("rejects an unauthenticated request", async () => {
            const res = await request(app).get("/note/files");
            expect(res.statusCode).to.equal(401);
        });
    });

    describe("GET /note/:id", () => {
        it("returns the note content for the owning user", async () => {
            const note = await Note.create({ user: user._id, title: "my-note", content: "body text" });

            const res = await request(app)
                .get(`/note/${note._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body.file.name).to.equal("my-note");
            expect(res.body.file.content).to.equal("body text");
        });

        it("rejects an invalid ObjectId format", async () => {
            const res = await request(app)
                .get("/note/not-a-valid-id")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal("Invalid file ID");
        });

        it("returns 404 for a note that does not exist", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .get(`/note/${fakeId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(404);
        });

        it("rejects an unauthenticated request", async () => {
            const note = await Note.create({ user: user._id, title: "my-note", content: "body text" });

            const res = await request(app).get(`/note/${note._id}`);
            expect(res.statusCode).to.equal(401);
        });
    });

    describe("DELETE /note/:id", () => {
        it("deletes the note for the owning user", async () => {
            const note = await Note.create({ user: user._id, title: "to-delete", content: "x" });

            const res = await request(app)
                .delete(`/note/${note._id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body.message).to.equal("File deleted successfully");

            const deleted = await Note.findById(note._id);
            expect(deleted).to.be.null;
        });

        it("rejects an invalid ObjectId format", async () => {
            const res = await request(app)
                .delete("/note/not-a-valid-id")
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(400);
        });

        it("returns 404 for a note that does not exist", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            const res = await request(app)
                .delete(`/note/${fakeId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.statusCode).to.equal(404);
        });

        it("rejects an unauthenticated request", async () => {
            const note = await Note.create({ user: user._id, title: "to-delete", content: "x" });

            const res = await request(app).delete(`/note/${note._id}`);
            expect(res.statusCode).to.equal(401);
        });
    });
});
