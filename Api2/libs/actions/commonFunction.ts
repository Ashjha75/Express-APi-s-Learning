const bcryptjs = require("bcryptjs")
import { Request, Response } from "express";
import User from "../../models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import { commonservices } from "../service/commonservices";
const commonServices = new commonservices()
export const hashedPassword = async (pass: string) => {
    const salt = 10;
    const hashedpass = await bcryptjs.hash(pass, salt)
    return hashedpass;
}

// setcookies 
export const setcookies = (token: string, res: Response) => {
    const oneday = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneday),
        secure: process.env.NODE_ENV == "PROD",
    })
}

export const isLoggedIn = async (req: Request, res: Response) => {
    try {

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return false;
        }
        const decodedToken = jwt.decode(token) as { exp: number };
        const expirationTime = decodedToken.exp * 1000; // convert to milliseconds
        const currentTime = Date.now();
        return currentTime >= expirationTime;
    } catch (error: any) {
        return false;
    }

}
