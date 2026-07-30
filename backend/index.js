const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");
const logger = require('./pinoPattern/logger');

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
<<<<<<< HEAD
            console.log(` Server running on http://localhost:${PORT}`);
        });s
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`Failed to start server: port ${PORT} is already in use.`);
            } else {
                console.error("Failed to start server:", error);
=======
            logger.info({ port: PORT }, "Server started");
        });

        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                logger.error({ err: error, port: PORT }, "Server port is already in use");
            } else {
                logger.error({ err: error }, "Failed to start server");
>>>>>>> 5b50a2e (Added pino Logging)
            }
            process.exit(1);
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to start server");
        process.exit(1);
    }
})();
