const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const userRoutes = require("./routes/user");
const logger = require('./pinoPattern/logger');
const notesRouter= require("./routes/note");

const app = express();
app.disable("x-powered-by");
const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200
};

app.use(pinoHttp({
    logger,
    customLogLevel: (req, res, error) => {
        if (error || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));


app.use("/user", userRoutes);
app.use("/note", notesRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use((error, req, res, next) => {
    req.log.error(
        { err: error, ...(error.context || {}) },
        "Unhandled request error"
    );

    if (res.headersSent) {
        return next(error);
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({ success: false, message: "Invalid data provided" });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    return res.status(error.status || 500).json({
        success: false,
        message: error.status ? error.message : "Something went wrong. Please try again later."
    });
});

module.exports = app;
