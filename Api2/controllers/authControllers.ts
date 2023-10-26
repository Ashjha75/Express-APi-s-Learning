import { hashedPassword, isLoggedIn, setcookies } from "../libs/actions/commonFunction";
import { Request, Response } from "express";
import User from "../models/User";
const bcryptjs = require("bcryptjs")
import jwt, { JwtPayload } from "jsonwebtoken";
import { commonservices } from "../libs/service/commonservices";
require("dotenv").config();
const commonServices = new commonservices()

type decoded = {
    id: string,
    email: string,
    username: string,
    role: string
}

// signup function
export const register = async (req: Request, res: Response) => {
    try {
        // get data from requests body
        const { username, email, password } = req.body;
        // validate the data
        if (!username || !email || !password) {
            return res.status(500).json({
                success: false,
                message: "Please fill all required field"
            })
        }
        // check if email already exists
        const isEmailAlreadyExists = await User.findOne({ email });
        const isUsernameAlreadyExists = await User.findOne({ username });
        if (isEmailAlreadyExists) {
            return res.status(500).json({
                success: false,
                message: "Email already exists"
            })
        }
        if (isUsernameAlreadyExists) {
            return res.status(500).json({
                success: false,
                message: "Username already exists"
            })
        }
        // hashed password 
        const hashedpass = await hashedPassword(password);
        const newUser = new User({ username, email, password: hashedpass });
        const newsavedUser = await newUser.save()

        return res.status(200).json({
            success: true,
            message: "User created successfully.",
            data: newsavedUser
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}


// Login function
export const login = async (req: Request, res: Response) => {
    try {
        // request body
        const { email, password } = req.body;
        // validate the req body data
        if (!email || !password) {
            return res.status(402).json({
                success: false,
                message: "Please fill all required field."
            })
        }
        // check email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(402).json({
                success: false,
                message: "User doesn't exists."
            })
        }
        const payload = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.roles
        }
        await commonServices.setvalue({
            id: user?._id,
            email: user?.email,
            username: user?.username,
            roles: user?.roles
        });

        // comare the password and generate token
        if (await bcryptjs.compare(password, user.password)) {
            let token = jwt.sign(payload, process.env.JWT_SECRET!, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;
            // set the global user details

            // set token in cookies
            setcookies(token, res);
            res.status(200).json({
                success: true,
                message: "User loggedin successfully",
                data: user
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// logout function
export const logout = async (req: Request, res: Response) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
        })

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// reset password function
export const resetPassword = async (req: Request, res: Response) => {
    try {
        console.log(commonServices.getvalue())
        const userLoggedIn = await isLoggedIn(req, res);
        if (!userLoggedIn) {
            // get data from request body
            const { email, password, newPassword } = req.body;
            // validate the data
            if (!email || !password || !newPassword) {
                return res.status(402).json({
                    success: false,
                    message: "Please fill all required field."
                })
            }
            // check email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(402).json({
                    success: false,
                    message: "User doesn't exists."
                })
            }
            if (await bcryptjs.compare(newPassword, user.password)) {
                return res.status(402).json({
                    success: false,
                    message: "New password cannot be same as old password."
                })
            }
            // comare the password and generate token
            if (await bcryptjs.compare(password, user.password)) {
                // hashed password
                const hashedpass = await hashedPassword(newPassword);
                user.password = hashedpass;
                await user.save()
                return res.status(200).json({
                    success: true,
                    message: "Password reset successfully",
                });
            }
        }
        else {
            return res.status(402).json({
                success: false,
                message: "User not logged in."
            })
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
// check user is logged in or not
