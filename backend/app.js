const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const corsOptions = {
    origin: "http://localhost:5173"||"http://localhost:5174",
    optionsSuccessStatus: 200
};

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

module.exports = app;