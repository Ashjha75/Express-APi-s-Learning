// export class CustomErrors extends Error {
//     // it takes message as input and pass it to its parent(Error class) constructor through super()
//     constructor(message: string) {
//         super(message);
//     }
// }


class ApiError extends Error {
    statusCode: number;
    errors?: any = [];
    success: boolean;
    data: any;
    constructor(
        stack = new Error().stack,
        statusCode: number = 500,
        message: string = "Something went wrong",
        errors?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.stack = stack;
        this.success = false;
        this.data = null;

        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor())
        }
    }
}
export { ApiError }