const express = require("express");
const Note = require("../models/note");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

const router = express.Router();

router.post("/save", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing",
            });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid Authorization header format",
            });
        }

        const token = authHeader.split(" ")[1];

        const profile = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const user = await User.findById(profile.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const {
            name,
            text,
            action,
            newName
        } = req.body;

        if (!name || text === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name and text are required",
            });
        }

        let finalName = name.replace(/[<>:"/\\|?*]/g, "_");

        let existingNote = await Note.findOne({
            user: user._id,
            title: finalName,
        });

        if (existingNote) {

            if (!action) {
                return res.status(409).json({
                    success: false,
                    requiresAction: true,
                    message: "A file with this name already exists.",
                    options: ["overwrite", "rename"],
                });
            }

            if (action === "overwrite") {

                existingNote.content = text;
                await existingNote.save();

                return res.status(200).json({
                    success: true,
                    message: "File overwritten successfully.",
                });
            }

            if (action === "rename") {

                if (!newName) {
                    return res.status(400).json({
                        success: false,
                        message: "New filename is required.",
                    });
                }

                finalName = newName.replace(/[<>:"/\\|?*]/g, "_");

                const duplicate = await Note.findOne({
                    user: user._id,
                    title: finalName,
                });

                if (duplicate) {
                    return res.status(409).json({
                        success: false,
                        requiresAction: true,
                        message: "That filename also already exists. Please choose another name.",
                    });
                }

                await Note.create({
                    user: user._id,
                    title: finalName,
                    content: text,
                });

                return res.status(200).json({
                    success: true,
                    message: "File saved with new name.",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid action.",
            });
        }

        await Note.create({
            user: user._id,
            title: finalName,
            content: text,
        });

        return res.status(200).json({
            success: true,
            message: "File saved successfully.",
        });

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.get("/files", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];

        const profile = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const user = await User.findById(profile.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const files = await Note.find({ user: user._id })
            .select("_id title content createdAt updatedAt")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            files: files.map((note) => ({
                _id: note._id,
                name: note.title,
                extension: "txt",
                size: Buffer.byteLength(note.content || "", "utf8"),
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
            })),
        });

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.get("/:id", async (req, res) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];

        const profile = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const user = await User.findById(profile.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file ID",
            });
        }

        const note = await Note.findOne({
            _id: req.params.id,
            user: user._id,
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        return res.status(200).json({
            success: true,
            file: {
                _id: note._id,
                name: note.title,
                extension: "txt",
                size: Buffer.byteLength(note.content || "", "utf8"),
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                content: note.content,
            },
        });

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];

        const profile = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        const user = await User.findById(profile.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file ID",
            });
        }

        const note = await Note.findOne({
            _id: req.params.id,
            user: user._id,
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        await note.deleteOne();

        return res.status(200).json({
            success: true,
            message: "File deleted successfully",
        });

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
module.exports = router;
