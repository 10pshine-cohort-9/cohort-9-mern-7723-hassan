const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../app");
const File = require("../models/file");

process.env.JWT_SECRET ||= "test-secret";

describe("File save persistence", () => {
    let token;

    beforeEach(async () => {
        await request(app)
            .post("/user/register")
            .send({
                username: "Alice",
                email: "alice@example.com",
                password: "Password@1"
            });

        const loginRes = await request(app)
            .post("/user/login")
            .send({
                email: "alice@example.com",
                password: "Password@1"
            });

        token = loginRes.body.token;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("preserves the existing file when metadata persistence fails during overwrite", async () => {
        const username = "Alice";
        const userFolder = path.join(__dirname, "..", "saved", username);
        const filePath = path.join(userFolder, "notes.txt");

        fs.mkdirSync(userFolder, { recursive: true });
        fs.writeFileSync(filePath, "original content", "utf8");

        jest.spyOn(File, "findOneAndUpdate").mockRejectedValueOnce(new Error("db failed"));

        const res = await request(app)
            .post("/file/save")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "notes",
                text: "new content",
                action: "overwrite"
            });

        expect(res.statusCode).toBe(500);
        expect(fs.readFileSync(filePath, "utf8")).toBe("original content");
        expect(fs.existsSync(`${filePath}.tmp`)).toBe(false);
    });

    it("does not create a new file when metadata persistence fails for a new save", async () => {
        const username = "Alice";
        const userFolder = path.join(__dirname, "..", "saved", username);
        const filePath = path.join(userFolder, "new-file.txt");

        fs.mkdirSync(userFolder, { recursive: true });

        jest.spyOn(File, "findOneAndUpdate").mockRejectedValueOnce(new Error("db failed"));

        const res = await request(app)
            .post("/file/save")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "new-file",
                text: "new content"
            });

        expect(res.statusCode).toBe(500);
        expect(fs.existsSync(filePath)).toBe(false);
        expect(fs.existsSync(`${filePath}.tmp`)).toBe(false);
    });
});
