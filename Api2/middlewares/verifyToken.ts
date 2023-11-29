import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
require("dotenv").config();
import { AuthRequest } from "../libs/service/interfaces/Request_Response.interface";

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (!token || token.split(" ")[0] !== "Bearer") {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid token.",
    });
  }

  try {
    const decoded = jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET!
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
