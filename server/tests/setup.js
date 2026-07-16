// Ensure required env vars exist even if .env isn't present in CI
process.env.JWT_ACCESS_SECRET ||= 'test_access_secret';
process.env.JWT_ACCESS_EXPIRES ||= '15m';
process.env.JWT_REFRESH_SECRET ||= 'test_refresh_secret';
process.env.JWT_REFRESH_EXPIRES ||= '7d';
process.env.COOKIE_EXPIRES_DAYS ||= '7';
process.env.CLIENT_URL ||= 'http://localhost:5173';
process.env.RATE_LIMIT_WINDOW_MIN ||= '15';
process.env.RATE_LIMIT_MAX ||= '1000'; // generous limit so tests don't get rate-limited

// Note: DB connection setup/teardown lives in tests/dbSetup.js and is opted
// into per-suite (see any *.test.js that calls setupTestDB()), rather than
// globally here — that way pure-logic suites (e.g. generateTokens.test.js)
// don't pay the cost of spinning up MongoMemoryServer at all.
