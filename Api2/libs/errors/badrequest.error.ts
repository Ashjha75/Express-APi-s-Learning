import { StatusCodes } from "http-status-codes";
import { CustomErrors } from "./custom-error";

export class BadRequestError extends CustomErrors {
    statusCode: any;
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }

}

