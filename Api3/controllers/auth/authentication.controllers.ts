import User from '../../models/auth/user.models'
import { NextFunction, Request, Response } from 'express';
const bcryptjs = require("bcryptjs");
import Jwt, { JwtPayload } from 'jsonwebtoken';
import { ApiError } from "../../utils/errors/ApiError";
import { asyncHandler } from '../../utils/errors/Asynchandler.errors';
import { Roles } from '../../constants';
import { emailVerificationMailgenContents, forgotPasswordMailgenContents, sendMail } from '../../utils/mails/sendMail.utils';
import { AuthRequest } from '../../../Api2/libs/service/interfaces/Request_Response.interface';
import path from 'path';
export const generateAccessAndRefreshToken = async (userId: any) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found", []);
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error: any) {
        throw new ApiError(
            500,
            "Something went wrong while generating the access token", []
        );

    }

}
const register = asyncHandler(async (req: Request, res: Response) => {
    const { userName, email, password, roles } = req.body;
    if (!userName || !email || !password) {
        throw new ApiError(400, "Please provide all the required fields");
    }
    // check if the user already exists
    const isExistingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (isExistingUser) {
        throw new ApiError(400, "User already exists", []);
    }
    // // hash the password
    // const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
        userName,
        email,
        password,
        roles: roles || Roles.User,
    });
    /**
  * unHashedToken: unHashed token is something we will send to the user's mail
  */

    const unHashedToken = await user.generateTemporaryToken();
    await sendMail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContents(
            user.userName,
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/auth/verify-email/${unHashedToken}`
        ),
    });
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
    });
});
const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, userName, password } = req.body;
    if (!email && !userName) {
        throw new ApiError(400, "Please fill all the credentials", [])
    }
    if (!password) {
        throw new ApiError(400, "Please provide password.")
    }
    // check for the existing user
    const isExistingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (!isExistingUser) {
        throw new ApiError(400, "User doesn't exists.")
    }
    // check password is correct or not
    const isPasswordCorrect = await isExistingUser.validatePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials.")
    }
    // generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(isExistingUser._id);
    // create an option object for cookie
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "PROD" ? true : false,
    };
    const user = await User.findById(isExistingUser._id).select('-password -emailVerificationToken -emailVerificationTokenExpiresAt -forgotPasswordToken -forgotPasswordTokenExpiresAt -refreshToken');
    // send the response
    return res.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json({
            message: "Successfully Login.",
            success: true,
            data: { user, accessToken, refreshToken }
        })
});
const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await User.findByIdAndUpdate(req.user?.id, { refreshToken: "" }, { new: true });
    const options = {
        httponly: true,
        secure: process.env.NODE_ENV === "PROD",
    };
    return res.status(200).
        clearCookie("refreshToken", options).
        clearCookie("accessToken", options).
        json({
            success: true,
            message: "Successfully logged out.",
        });
})
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token;
    if (!token) {
        throw new ApiError(400, "Invalid token", []);
    }
    const hashedToken = await Jwt.verify(token, process.env.JWT_EMAIL_TOKEN_SECRET!) as JwtPayload;

    // change the isEmailVerified to true after successful verification of email

    await User.findByIdAndUpdate(hashedToken.id, { isEmailVerified: true });

    res.sendFile(path.join(__dirname, '../../utils/public/email.html'), (err) => {
        if (err) {
            throw new ApiError(400, "Something went wrong while sending the email", []);
        }
    })
})
// if user is loggedin and email is yet not verified than we will send the resend email token 
const resendEmailVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUser = await User.findById(req?.user?.id);
    if (!currentUser) {
        throw new ApiError(400, "User not exists.", []);
    }
    if (currentUser?.isEmailVerified) {
        throw new ApiError(400, "Email is already verified", []);
    }
    const unHashedToken = await currentUser.generateTemporaryToken();
    await sendMail({
        email: currentUser?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContents(
            currentUser.userName,
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/auth/verify-email/${unHashedToken}`
        ),
    });
    res.status(200).json({
        success: true,
        message: "Email verification link has been sent to your email.",
    });

})
// refresh token
const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh Token is missing.", []);
    }
    const decodeToken = Jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!) as JwtPayload;
    const user = await User.findById(decodeToken?.id);
    if (!user) {
        throw new ApiError(400, "Invalid refresh token", []);
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(400, "Refresh token is expired or used", []);
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);
    const options = {
        httOnly: true,
        secure: process.env.NODE_ENV === "PROD",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
    res.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json({
            success: true,
            message: "Successfully refreshed the token.",
            data: { accessToken, refreshToken }
        })
})
// change password
const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Please fill all required credentilas.")
    }
    const currentUser = await User.findById(req?.user?.id);
    if (!currentUser) {
        throw new ApiError(400, "User not found", []);
    }
    const isPasswordCorrect = await currentUser.validatePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect", []);
    }
    currentUser.password = newPassword;
    currentUser.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    }
    )
});
// forgot password
const forgotPasswordRequest = asyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email) {
        throw new ApiError(400, "Email is required", []);
    }
    const isExistingUser = await User.findOne({ email });
    if (!isExistingUser) {
        throw new ApiError(400, "User not exists", []);
    }
    const unhashedToken = await isExistingUser.generateTemporaryToken();

    await sendMail({
        email: email,
        subject: "Password Reset Request",
        mailgenContent: forgotPasswordMailgenContents(isExistingUser.userName,
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/auth/reset-password/${unhashedToken}`
        )
    })
    res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email.",
    })
})
// reset forgot password
const resetForgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token;
    const { newPassword } = req.body;
    if (!token) {
        throw new ApiError(400, "Invalid token", []);
    }
    if (!newPassword) {
        throw new ApiError(400, "Please provide new password", []);
    }
    const hashedToken = await Jwt.verify(token, process.env.JWT_EMAIL_TOKEN_SECRET!) as JwtPayload;
    const isExistingUser = await User.findById(hashedToken.id);
    if (!isExistingUser) {
        throw new ApiError(400, "User not exists", []);
    }
    isExistingUser.password = newPassword;
    await isExistingUser.save();
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    })
})
// assign role
const assignRole = asyncHandler(async (req: Request, res: Response) => {
    const { userName, role } = req.body;
    if (!userName || !role) {
        throw new ApiError(400, "Please provide all credentials", []);
    }
    const currentUser = await User.findOne({ userName });
    if (!currentUser) {
        throw new ApiError(400, "User not exists", []);
    }
    if (!Object.values(currentUser.roles).includes(role)) {
        throw new ApiError(400, `Invalid role: ${role}`, []);
    }
    currentUser.roles = role;
    currentUser.save();
    res.status(200).json({
        success: true,
        message: "Role Assigned Successfully"
    })
})

export { register, login, logout, verifyEmail, resendEmailVerification, refreshToken, changePassword, forgotPasswordRequest, resetForgotPassword, assignRole };   
