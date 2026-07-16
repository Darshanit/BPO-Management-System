const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../utils/generateTokens');

describe('Token utilities', () => {
  const fakeUser = { _id: '64abc123def456abc123def4', role: 'admin', tokenVersion: 0 };

  it('generates an access token that verifies back to the same user id and role', () => {
    const token = generateAccessToken(fakeUser);
    const decoded = verifyAccessToken(token);

    expect(decoded.id).toBe(String(fakeUser._id));
    expect(decoded.role).toBe(fakeUser.role);
  });

  it('generates a refresh token carrying the tokenVersion', () => {
    const token = generateRefreshToken(fakeUser);
    const decoded = verifyRefreshToken(token);

    expect(decoded.id).toBe(String(fakeUser._id));
    expect(decoded.tokenVersion).toBe(0);
  });

  it('throws when verifying an access token with the refresh secret', () => {
    const token = generateAccessToken(fakeUser);
    expect(() => verifyRefreshToken(token)).toThrow();
  });

  it('throws when verifying a tampered token', () => {
    const token = generateAccessToken(fakeUser);
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});
