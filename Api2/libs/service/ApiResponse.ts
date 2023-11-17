class ApiResponse {
    statusCode: number;
    success: boolean;
    data: any;
    message: string;

    constructor(statusCode: number, success: boolean, data: any, message: string = "Success") {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.data = data;
        this.message = message;
    }

}
export { ApiResponse };