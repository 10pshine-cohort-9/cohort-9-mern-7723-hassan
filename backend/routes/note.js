const express = require("express");
const Note = require("../models/note");
const mongoose = require("mongoose");
const auth = require('../middleware/auth');
const logger = require('../pinoPattern/logger');
const socket = require("../socket");
const router = express.Router();

router.post("/save", auth, async (req, res, next) => {
    try {
        const user = req.user;
        const { name, text, action, newName } = req.body;
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
                socket.getIO().to(`user:${user._id}`).emit("note:updated", {
                    _id: existingNote._id,
                    name: finalName,
                    content: existingNote.content,
                });
                logger.info(
                    { userId: user._id, noteId: existingNote._id },
                    "Note overwritten"
                );
                return res.status(200).json({
                    success: true,
                    message: "File overwritten successfully.",
                    note: {
                        _id: existingNote._id,
                        name: finalName,
                    },
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
                existingNote.title = finalName;
                existingNote.content = text;
                await existingNote.save();
                socket.getIO().to(`user:${user._id}`).emit("note:updated", {
                    _id: existingNote._id,
                    name: finalName,
                    content: existingNote.content,
                });
                logger.info(
                    { userId: user._id, noteId: existingNote._id },
                    "Note renamed"
                );
                return res.status(200).json({
                    success: true,
                    message: "File renamed and saved.",
                    note: {
                        _id: existingNote._id,
                        name: finalName,
                    },
                });
            }
            return res.status(400).json({
                success: false,
                message: "Invalid action.",
            });
        }
        const createdNote = await Note.create({
            user: user._id,
            title: finalName,
            content: text,
        });
        socket.getIO().to(`user:${user._id}`).emit("note:created", {
            _id: createdNote._id,
            name: finalName,
            content: createdNote.content,
        });
        logger.info(
            { userId: user._id, noteId: createdNote._id },
            "Note created"
        );
        return res.status(200).json({
            success: true,
            message: "File saved successfully.",
            note: {
                _id: createdNote._id,
                name: finalName,
            },
        });
    } catch (error) {
        error.context = { userId: req.user?._id };
        next(error);
    }
});

router.get("/files", auth, async (req, res, next) => {
    try {
        const user = req.user;
        const files = await Note.find({ user: user._id })
            .select("_id title content createdAt updatedAt")
            .sort({ updatedAt: -1 });
        logger.info(
            { userId: user._id, fileCount: files.length },
            "Notes retrieved"
        );
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
        error.context = { userId: req.user?._id };
        next(error);
    }
});

router.get("/:id", auth, async (req, res, next) => {
    try {
        const user = req.user;
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
        logger.info(
            { userId: user._id, noteId: note._id },
            "Note retrieved"
        );
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
        error.context = { userId: req.user?._id, noteId: req.params.id };
        next(error);
    }
});

router.delete("/:id", auth, async (req, res, next) => {
    try {
        const user = req.user;
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
        socket.getIO().to(`user:${user._id}`).emit("note:deleted", {
            _id: note._id,
        });
        logger.info(
            { userId: user._id, noteId: note._id },
            "Note deleted"
        );
        return res.status(200).json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        error.context = { userId: req.user?._id, noteId: req.params.id };
        next(error);
    }
});

module.exports = router;