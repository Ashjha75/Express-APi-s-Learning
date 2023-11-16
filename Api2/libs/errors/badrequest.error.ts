import { StatusCodes } from "http-status-codes";
import { ApiError } from "./ApiError.error";

export class BadRequestError extends ApiError {
    statusCode: any;
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }

}

