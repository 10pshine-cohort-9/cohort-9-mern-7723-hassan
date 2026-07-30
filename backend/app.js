const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");
const userRoutes = require("./routes/user");
const logger = require('./pinoPattern/logger');

const app = express();

const corsOptions = {
    origin: "http://localhost:5173"||"http://localhost:5174",
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

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use((error, req, res, next) => {
    req.log.error({ err: error }, "Unhandled request error");

    if (res.headersSent) {
        return next(error);
    }

    return res.status(error.status || 500).json({
        success: false,
        message: error.status ? error.message : "Internal server error"
    });
});

module.exports = app;
