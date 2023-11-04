import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export interface myErrorStatus extends Error {
  statusCode: any;
}
