const { Router } = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const router = Router();
const logger = require('../pinoPattern/logger');

const saltRounds = 10;
logger.info("User routes loaded");
router.get("/test", (req, res) => {
    res.send("Test route works");
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, foundUser.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: foundUser._id,
                email: foundUser.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

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
        logger.error({ err: error }, "User login failed");
        return res.status(500).json({
            success: false,
            message: "Unable to log in"
        });
    }
});

router.post("/register", async (req, res) => {
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

    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
        success: true,
        message: "User registered successfully"
    });
});
router.get("/profile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid Authorization header format"
            });
        }

        const token = authHeader.split(" ")[1];

        const profile_details = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(profile_details.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user
        });

    } catch (error) {
        logger.error({ err: error }, "User login failed");
        logger.warn({ err: error }, "JWT verification failed");
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
});
module.exports = router;
