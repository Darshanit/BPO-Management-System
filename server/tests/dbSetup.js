const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Call from a DB-dependent test file's own beforeAll/afterEach/afterAll:
 *
 *   const { setupTestDB, teardownTestDB, clearTestDB } = require('./dbSetup');
 *   beforeAll(setupTestDB);
 *   afterEach(clearTestDB);
 *   afterAll(teardownTestDB);
 *
 * Kept opt-in per suite (rather than a global Jest setup file) so pure-logic
 * suites don't spin up an in-memory MongoDB instance at all.
 *
 * NOTE: mongodb-memory-server downloads a real mongod binary from
 * fastdl.mongodb.org the first time it runs, then caches it locally. That
 * download requires outbound network access to mongodb.org — if you're
 * running this in a network-restricted environment (e.g. an offline CI
 * runner or a sandboxed container that only allowlists specific hosts),
 * these suites will fail until that host is reachable at least once.
 */
const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
};

const teardownTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

module.exports = { setupTestDB, clearTestDB, teardownTestDB };
