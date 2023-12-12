"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRole = exports.resetForgotPassword = exports.forgotPasswordRequest = exports.changePassword = exports.refreshToken = exports.resendEmailVerification = exports.verifyEmail = exports.logout = exports.login = exports.register = exports.generateAccessAndRefreshToken = void 0;
const user_models_1 = __importDefault(require("../../models/auth/user.models"));
const bcryptjs = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = require("../../utils/errors/ApiError");
const Asynchandler_errors_1 = require("../../utils/errors/Asynchandler.errors");
const constants_1 = require("../../constants");
const sendMail_utils_1 = require("../../utils/mails/sendMail.utils");
const path_1 = __importDefault(require("path"));
const generateAccessAndRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_models_1.default.findById(userId);
        if (!user) {
            throw new ApiError_1.ApiError(404, "User not found", []);
        }
        const accessToken = yield user.generateAccessToken();
        const refreshToken = yield user.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Something went wrong while generating the access token", []);
    }
});
exports.generateAccessAndRefreshToken = generateAccessAndRefreshToken;
const register = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, password, roles } = req.body;
    if (!userName || !email || !password) {
        throw new ApiError_1.ApiError(400, "Please provide all the required fields");
    }
    // check if the user already exists
    const isExistingUser = yield user_models_1.default.findOne({ $or: [{ userName }, { email }] });
    if (isExistingUser) {
        throw new ApiError_1.ApiError(400, "User already exists", []);
    }
    // // hash the password
    // const hashedPassword = await bcryptjs.hash(password, 10);
    const user = yield user_models_1.default.create({
        userName,
        email,
        password,
        roles: roles || constants_1.Roles.User,
    });
    /**
  * unHashedToken: unHashed token is something we will send to the user's mail
  */
    const unHashedToken = yield user.generateTemporaryToken();
    yield (0, sendMail_utils_1.sendMail)({
        email: user === null || user === void 0 ? void 0 : user.email,
        subject: "Please verify your email",
        mailgenContent: (0, sendMail_utils_1.emailVerificationMailgenContents)(user.userName, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`),
    });
    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
    });
}));
exports.register = register;
const login = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, userName, password } = req.body;
    if (!email && !userName) {
        throw new ApiError_1.ApiError(400, "Please fill all the credentials", []);
    }
    if (!password) {
        throw new ApiError_1.ApiError(400, "Please provide password.");
    }
    // check for the existing user
    const isExistingUser = yield user_models_1.default.findOne({ $or: [{ email }, { userName }] });
    if (!isExistingUser) {
        throw new ApiError_1.ApiError(400, "User doesn't exists.");
    }
    // check password is correct or not
    const isPasswordCorrect = yield isExistingUser.validatePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError_1.ApiError(400, "Invalid credentials.");
    }
    // generate access and refresh token
    const { accessToken, refreshToken } = yield (0, exports.generateAccessAndRefreshToken)(isExistingUser._id);
    // create an option object for cookie
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "PROD" ? true : false,
    };
    const user = yield user_models_1.default.findById(isExistingUser._id).select('-password -emailVerificationToken -emailVerificationTokenExpiresAt -forgotPasswordToken -forgotPasswordTokenExpiresAt -refreshToken');
    // send the response
    return res.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json({
        message: "Successfully Login.",
        success: true,
        data: { user, accessToken, refreshToken }
    });
}));
exports.login = login;
const logout = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const users = yield user_models_1.default.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { refreshToken: "" }, { new: true });
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
}));
exports.logout = logout;
const verifyEmail = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    if (!token) {
        throw new ApiError_1.ApiError(400, "Invalid token", []);
    }
    const hashedToken = yield jsonwebtoken_1.default.verify(token, process.env.JWT_EMAIL_TOKEN_SECRET);
    // change the isEmailVerified to true after successful verification of email
    yield user_models_1.default.findByIdAndUpdate(hashedToken.id, { isEmailVerified: true });
    res.sendFile(path_1.default.join(__dirname, '../../utils/public/email.html'), (err) => {
        if (err) {
            throw new ApiError_1.ApiError(400, "Something went wrong while sending the email", []);
        }
    });
}));
exports.verifyEmail = verifyEmail;
// if user is loggedin and email is yet not verified than we will send the resend email token 
const resendEmailVerification = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const currentUser = yield user_models_1.default.findById((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id);
    if (!currentUser) {
        throw new ApiError_1.ApiError(400, "User not exists.", []);
    }
    if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.isEmailVerified) {
        throw new ApiError_1.ApiError(400, "Email is already verified", []);
    }
    const unHashedToken = yield currentUser.generateTemporaryToken();
    yield (0, sendMail_utils_1.sendMail)({
        email: currentUser === null || currentUser === void 0 ? void 0 : currentUser.email,
        subject: "Please verify your email",
        mailgenContent: (0, sendMail_utils_1.emailVerificationMailgenContents)(currentUser.userName, `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`),
    });
    res.status(200).json({
        success: true,
        message: "Email verification link has been sent to your email.",
    });
}));
exports.resendEmailVerification = resendEmailVerification;
// refresh token
const refreshToken = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError_1.ApiError(400, "Refresh Token is missing.", []);
    }
    const decodeToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    const user = yield user_models_1.default.findById(decodeToken === null || decodeToken === void 0 ? void 0 : decodeToken.id);
    if (!user) {
        throw new ApiError_1.ApiError(400, "Invalid refresh token", []);
    }
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError_1.ApiError(400, "Refresh token is expired or used", []);
    }
    const { refreshToken, accessToken } = yield (0, exports.generateAccessAndRefreshToken)(user._id);
    const options = {
        httOnly: true,
        secure: process.env.NODE_ENV === "PROD",
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
    res.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json({
        success: true,
        message: "Successfully refreshed the token.",
        data: { accessToken, refreshToken }
    });
}));
exports.refreshToken = refreshToken;
// change password
const changePassword = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError_1.ApiError(400, "Please fill all required credentilas.");
    }
    const currentUser = yield user_models_1.default.findById((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id);
    if (!currentUser) {
        throw new ApiError_1.ApiError(400, "User not found", []);
    }
    const isPasswordCorrect = yield currentUser.validatePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError_1.ApiError(400, "Password is incorrect", []);
    }
    currentUser.password = newPassword;
    currentUser.save();
    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
}));
exports.changePassword = changePassword;
// forgot password
const forgotPasswordRequest = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    if (!email) {
        throw new ApiError_1.ApiError(400, "Email is required", []);
    }
    const isExistingUser = yield user_models_1.default.findOne({ email });
    if (!isExistingUser) {
        throw new ApiError_1.ApiError(400, "User not exists", []);
    }
    const unhashedToken = yield isExistingUser.generateTemporaryToken();
    yield (0, sendMail_utils_1.sendMail)({
        email: email,
        subject: "Password Reset Request",
        mailgenContent: (0, sendMail_utils_1.forgotPasswordMailgenContents)(isExistingUser.userName, `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${unhashedToken}`)
    });
    res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email.",
    });
}));
exports.forgotPasswordRequest = forgotPasswordRequest;
// reset forgot password
const resetForgotPassword = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const { newPassword } = req.body;
    if (!token) {
        throw new ApiError_1.ApiError(400, "Invalid token", []);
    }
    if (!newPassword) {
        throw new ApiError_1.ApiError(400, "Please provide new password", []);
    }
    const hashedToken = yield jsonwebtoken_1.default.verify(token, process.env.JWT_EMAIL_TOKEN_SECRET);
    const isExistingUser = yield user_models_1.default.findById(hashedToken.id);
    if (!isExistingUser) {
        throw new ApiError_1.ApiError(400, "User not exists", []);
    }
    isExistingUser.password = newPassword;
    yield isExistingUser.save();
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
}));
exports.resetForgotPassword = resetForgotPassword;
// assign role
const assignRole = (0, Asynchandler_errors_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, role } = req.body;
    if (!userName || !role) {
        throw new ApiError_1.ApiError(400, "Please provide all credentials", []);
    }
    const currentUser = yield user_models_1.default.findOne({ userName });
    if (!currentUser) {
        throw new ApiError_1.ApiError(400, "User not exists", []);
    }
    if (!Object.values(currentUser.roles).includes(role)) {
        throw new ApiError_1.ApiError(400, `Invalid role: ${role}`, []);
    }
    currentUser.roles = role;
    currentUser.save();
    res.status(200).json({
        success: true,
        message: "Role Assigned Successfully"
    });
}));
exports.assignRole = assignRole;
