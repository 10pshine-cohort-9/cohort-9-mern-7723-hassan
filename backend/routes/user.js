const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const logger = require('../pinoPattern/logger');

const router = Router();
const saltRounds = 10;
const DUMMY_HASH = "qjkde1x1x7yxnhuz1mj2k9u";

router.get("/test", (req, res) => {
    res.send("Test route works");
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const foundUser = await User.findOne({ email });

        const isMatch = await bcrypt.compare(
            password,
            foundUser?.password || DUMMY_HASH
        );

        if (!foundUser || !isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            { id: foundUser._id, email: foundUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        logger.info({ userId: foundUser._id }, "User logged in");

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email
            },
            token
        });

    } catch (error) {
        error.context = { userId: foundUser?._id };
        next(error);
    }
});

router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const passwordRegex =
            /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long and contain at least one number and one special character."
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        logger.info({ userId: newUser._id }, "User registered");

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }
        error.context = { email: req.body?.email };
        next(error);
    }
});

router.get("/profile", auth, async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: req.user
        });
    } catch (error) {
        error.context = { userId: req.user?._id };
        next(error);
    }
});

module.exports = router;