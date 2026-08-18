const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: { origin: "http://localhost:5173" }
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(`user:${socket.userId}`);
        socket.on("disconnect", () => {});
    });

    return io;
}

function getIO() {
    if (!io) {
        return { to: () => ({ emit: () => {} }) };
    }
    return io;
}

module.exports = { initSocket, getIO };