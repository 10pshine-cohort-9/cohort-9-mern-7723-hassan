const mongoose = require("mongoose");

const logger = require('../pinoPattern/logger');
const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set. Add it to backend/.env before starting the server.");
    }

    try {
    let conn= await mongoose.connect(mongoUri);
      await mongoose.connect(mongoUri);
    } catch (error) {
        logger.error({ err: error }, "MongoDB connection failed");
        throw error;
    }

};

module.exports = connectDB;
