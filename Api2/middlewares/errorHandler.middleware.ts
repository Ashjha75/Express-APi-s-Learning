import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "http";
import { myErrorStatus } from "../libs/service/interfaces/Request_Response.interface";

export const errorHandler = (
  err: myErrorStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    statusCode: err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong try again later",
  };
  if (err.name === "ValidationError") {
  }
};
