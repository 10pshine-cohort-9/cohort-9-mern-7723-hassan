const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const http = require("http");                  
const app = require("./app");
const logger = require('./pinoPattern/logger');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const { initSocket } = require("./socket");
const io = initSocket(server);

(async () => {
    try {
        await connectDB();

        // OLD:
        // const server = app.listen(PORT, () => {
        //     logger.info({ port: PORT }, "Server started");
        // });

        // NEW — server already created above, just start listening on it
        server.listen(PORT, () => {
            logger.info({ port: PORT }, "Server started");
        });

        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                logger.error({ err: error, port: PORT }, "Server port is already in use");
            } else {
                logger.error({ err: error, port: PORT }, "Failed to start server");
            }
            process.exit(1);
        });
    } catch (error) {
        logger.error({ err: error, port: PORT }, "Failed to start server");
        process.exit(1);
    }
})();