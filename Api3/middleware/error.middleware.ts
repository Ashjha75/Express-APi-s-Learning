import mongoose from "mongoose";
import { ApiError } from "../utils/errors/ApiError"
import { NextFunction, Request, Response } from "express";
require("dotenv").config()

export interface myError extends Error {
    statusCode?: number;
    errors?: any[];
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let error: myError = err;
    let message = "Something went wrong.";
    if (!(error instanceof ApiError)) {
        const statusCode = error?.statusCode || error instanceof mongoose.Error ? 400 : 500;
        message = error.message || "Something went wrong.";
        error = new ApiError(statusCode, message, error?.errors || [], error.stack)
    }
    const response = {
        ...error,
        message: (error.message),
        ...(process.env.NODE_ENV === "DEV" ? { stack: error.stack } : {}),

    }
    return res.status(error.statusCode!).json(response);
}

export { errorHandler };
