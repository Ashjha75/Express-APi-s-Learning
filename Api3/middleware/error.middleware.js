"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = require("../utils/errors/ApiError");
require("dotenv").config();
// const errorHandler = (err: myError, req: Request, res: Response, next: NextFunction) => {
//     let message = "Something went wrong.";
//     if (!(err instanceof ApiError)) {
//         const statusCode = (err?.statusCode || err instanceof mongoose.Error) ? 400 : 500;
//         message = err.message || "Something went wrong.";
//         if (process.env.NODE_ENV == "DEV")
//             err = new ApiError(statusCode, message, err?.errors || [], err.stack)
//         else {
//             if (message.includes(": ")) {
//                 message = message.split(": ")[2];
//             }
//             err = new ApiError(statusCode, message, [], err.stack)
//         }
//     }
//     const response = {
//         ...err,
//         message: (err.message),
//         ...(process.env.NODE_ENV === "DEV" ? { stack: err.stack } : {}),
//     }
//     return res.status(err.statusCode!).json(response);
// }
const errorHandler = (err, req, res, next) => {
    console.log('Error received:', err); // Log the error received
    let message = "Something went wrong.";
    let statusCode = 500; // Default to 500
    if (!(err instanceof ApiError_1.ApiError)) {
        if (err === null || err === void 0 ? void 0 : err.statusCode) {
            statusCode = err.statusCode;
        }
        else if (err instanceof mongoose_1.default.Error) {
            statusCode = 400;
        }
        message = err.message || "Something went wrong.";
        if (process.env.NODE_ENV == "DEV") {
            err = new ApiError_1.ApiError(statusCode, message, (err === null || err === void 0 ? void 0 : err.errors) || [], err.stack);
        }
        else {
            if (message.includes(": ")) {
                message = message.split(": ")[2];
            }
            err = new ApiError_1.ApiError(statusCode, message, [], err.stack);
        }
    }
    const response = Object.assign(Object.assign(Object.assign({}, err), { message: (err.message) }), (process.env.NODE_ENV === "DEV" ? { stack: err.stack } : {}));
    return res.status(err.statusCode).json(response);
};
exports.errorHandler = errorHandler;
