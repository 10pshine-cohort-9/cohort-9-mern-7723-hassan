const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set. Add it to backend/.env before starting the server.");
    }

    let conn;

    try {
        conn = await mongoose.connect(mongoUri);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }


};

module.exports = connectDB;
