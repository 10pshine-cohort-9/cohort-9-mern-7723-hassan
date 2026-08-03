const express = require("express");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/user");
const File = require("../models/file");

const router = express.Router();

function ensureWithinSavedRoot(rootDir, candidatePath) {
    const resolvedRoot = path.resolve(rootDir);
    const resolvedPath = path.resolve(candidatePath);
    const relativePath = path.relative(resolvedRoot, resolvedPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new Error("Resolved path escapes the saved root.");
    }

    return resolvedPath;
}

async function saveFileRecord(userId, finalName, relativePath, sourcePath) {
    try {
        const stats = await fsp.stat(sourcePath);

        await File.findOneAndUpdate(
            {
                user: userId,
                name: finalName,
            },
            {
                user: userId,
                name: finalName,
                fileName: `${finalName}.txt`,
                filePath: relativePath,
                extension: "txt",
                size: stats.size,
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        );
    } catch (error) {
        throw new Error(`Failed to save file record: ${error.message}`);
    }
}

async function fileExists(filePath) {
    try {
        await fsp.access(filePath);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }
        throw error;
    }
}

async function saveAndPublishFile(userId, finalName, relativePath, absolutePath, text) {
    const temporaryPath = `${absolutePath}.tmp`;

    try {
        await fsp.writeFile(temporaryPath, text, "utf8");
        await saveFileRecord(userId, finalName, relativePath, temporaryPath);
        await fsp.rename(temporaryPath, absolutePath);
    } finally {
        try {
            await fsp.unlink(temporaryPath);
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
    }
}

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

        if (!name || !text) {
            return res.status(400).json({
                success: false,
                message: "Name and text are required",
            });
        }

        const safeUsername = String(user.username || "")
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .replace(/^_+|_+$/g, "") || `user-${user._id.toString()}`;

        const savedRoot = path.resolve(__dirname, "..", "saved");
        const userFolder = ensureWithinSavedRoot(
            savedRoot,
            path.join(savedRoot, safeUsername)
        );

        await fsp.mkdir(userFolder, { recursive: true });

        let finalName = name.replace(/[<>:"/\\|?*]/g, "_");

        let relativePath = path.join(
            "saved",
            safeUsername,
            `${finalName}.txt`
        );

        let absolutePath = ensureWithinSavedRoot(
            savedRoot,
            path.join(__dirname, "..", relativePath)
        );

        if (await fileExists(absolutePath)) {

            if (!action) {
                return res.status(409).json({
                    success: false,
                    requiresAction: true,
                    message: "A file with this name already exists.",
                    options: ["overwrite", "rename"]
                });
            }

            if (action === "overwrite") {

                await saveAndPublishFile(
                    user._id,
                    finalName,
                    relativePath,
                    absolutePath,
                    text
                );

                return res.status(200).json({
                    success: true,
                    message: "File overwritten successfully."
                });
            }
            if (action === "rename") {

                if (!newName) {
                    return res.status(400).json({
                        success: false,
                        message: "New filename is required."
                    });
                }

                finalName = newName.replace(/[<>:"/\\|?*]/g, "_");

                relativePath = path.join(
                    "saved",
                    safeUsername,
                    `${finalName}.txt`
                );

                absolutePath = ensureWithinSavedRoot(
                    savedRoot,
                    path.join(__dirname, "..", relativePath)
                );

                if (await fileExists(absolutePath)) {
                    return res.status(409).json({
                        success: false,
                        requiresAction: true,
                        message: "That filename also already exists. Please choose another name."
                    });
                }

                await saveAndPublishFile(
                    user._id,
                    finalName,
                    relativePath,
                    absolutePath,
                    text
                );

                return res.status(200).json({
                    success: true,
                    message: "File saved with new name."
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid action."
            });
        }

        await saveAndPublishFile(
            user._id,
            finalName,
            relativePath,
            absolutePath,
            text
        );

        return res.status(200).json({
            success: true,
            message: "File saved successfully."
        });

    }  catch (error) {

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

        const files = await File.find({ user: user._id })
            .select("_id name extension size createdAt updatedAt")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            files,
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

        const file = await File.findOne({
            _id: req.params.id,
            user: user._id,
        });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        const absolutePath = path.join(
            __dirname,
            "..",
            file.filePath
        );

        if (!await fileExists(absolutePath)) {
            return res.status(404).json({
                success: false,
                message: "Physical file not found",
            });
        }

        const content = await fsp.readFile(
            absolutePath,
            "utf8"
        );

        return res.status(200).json({
            success: true,
            file: {
                _id: file._id,
                name: file.name,
                extension: file.extension,
                size: file.size,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,
                content,
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

module.exports = router;
