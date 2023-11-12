import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../libs/service/interfaces/Request_Response.interface";

export const authorizeUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log(req?.user);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "please provide token",
    });
  }
  const decodedToken = jwt.decode(token!) as JwtPayload;
  if (decodedToken.role !== "USER") {
    return res.status(401).json({
      success: false,
      message: "User not authorized.",
    });
  }
  next();
};
