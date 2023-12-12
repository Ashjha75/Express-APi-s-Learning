"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode = 500, message = "Something went wrong", errors, stack = new Error().stack) {
        super(message);
        this.errors = [];
        this.statusCode = statusCode,
            this.errors = errors,
            this.stack = stack,
            this.success = false,
            this.data = null;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor());
        }
    }
}
exports.ApiError = ApiError;
