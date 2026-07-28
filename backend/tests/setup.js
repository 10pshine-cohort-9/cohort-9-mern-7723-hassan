const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

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

beforeAll(async () => {
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
});

afterEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    let teardownError;

    try {
        await mongoose.connection.dropDatabase();
    } catch (error) {
        teardownError = error;
        throw error;
    } finally {
        try {
            await closeDatabaseResources();
        } catch (cleanupError) {
            if (teardownError) {
                preserveOriginalError(teardownError, cleanupError);
            } else {
                throw cleanupError;
            }
        }
    }
});
