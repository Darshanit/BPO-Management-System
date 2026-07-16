/**
 * Standardized success response shape so the frontend can rely on
 * a consistent { success, message, data } envelope for every endpoint.
 */
class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta; // pagination info, counts, etc.
  }
}

module.exports = ApiResponse;
