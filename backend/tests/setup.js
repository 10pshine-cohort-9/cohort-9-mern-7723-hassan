const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

let mongoServer;

function preserveOriginalError(originalError, cleanupError) {
    if (originalError && typeof originalError === "object") {
        originalError.cleanupError = cleanupError;
    }
}

async function closeDatabaseResources() {
    let cleanupError;

    try {
        await mongoose.connection.close();
    } catch (error) {
        cleanupError = error;
    } finally {
        try {
            if (mongoServer) {
                await mongoServer.stop();
            }
        } catch (error) {
            cleanupError ??= error;
        } finally {
            mongoServer = undefined;
        }
    }

    if (cleanupError) {
        throw cleanupError;
    }
}

exports.mochaHooks = {
    /**
 * Starts the in-memory MongoDB server and connects Mongoose.
 */

    async beforeAll() {
        let setupError;

        try {
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            await mongoose.connect(uri);
        } catch (error) {
            setupError = error;
            throw error;
        } finally {
            if (setupError) {
                try {
                    await closeDatabaseResources();
                } catch (cleanupError) {
                    preserveOriginalError(setupError, cleanupError);
                }
            }
        }
    },

    async afterEach() {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    },
    /**
 * Closes the database connection and stops the MongoDB memory server.
 */
    async afterAll() {
        let teardownError;
        let cleanupError;

        try {
            await mongoose.connection.dropDatabase();
        } catch (error) {
            teardownError = error;
        } finally {
            try {
                await closeDatabaseResources();
            } catch (error) {
                cleanupError = error;
                if (teardownError) {
                    preserveOriginalError(teardownError, cleanupError);
                }
            }
        }

        if (teardownError) throw teardownError;
        if (cleanupError) throw cleanupError;
    },
};