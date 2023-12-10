const express = require("express");
import { Response } from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware";
// import { authorizeUser } from "../middlewares/authorizeUser.middlleware";
// import { verifyToken } from "../middlewares/verifyToken";
// import { addProduct } from "../controllers/productsControllers";
const router = express.Router();
const {
    register, login, logout, verifyEmail, resendEmailVerification, refreshToken, forgotPasswordRequest, resetForgotPassword, changePassword, assignRole
} = require("../../controllers/auth/authentication.controllers");

// documentation
/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *       - User Authentication
 *     description: Register a new user
 *     parameters:
 *       - name: user
 *         description: User to be registered.
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               default: 'default_username'
 *             password:
 *               type: string
 *               default: 'default_password'
 *             email:
 *               type: string
 *               default: 'default@email.com'
 *     responses:
 *       200:
 *         description: Successfully registered
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - User Authentication
 *     description: Login a user
 *     parameters:
 *       - name: username
 *         description: Username to use for login.
 *         in: body
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 */

/**
 * @swagger
 * /verify-email/{token}:
 *   get:
 *     tags:
 *       - User Authentication
 *     description: Verify email
 *     parameters:
 *       - name: token
 *         description: Verification token.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Email verified
 */

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     tags:
 *       - User Authentication
 *     description: Refresh token
 *     parameters:
 *       - name: token
 *         description: Current token.
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 */
// Authentication routes 
// before login || unsecured routes
router.post("/signup", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh-token", verifyToken, refreshToken);
router.post("/forgot-password", forgotPasswordRequest);
router.post("/reset-password/:token", resetForgotPassword);

// after login || secured routes
router.post("/logout", verifyToken, logout);
router.post("/resend-email-verification", verifyToken, resendEmailVerification);
router.post("/change-password", verifyToken, changePassword);
router.post("/assign-role", verifyToken, assignRole);
// router.post("/resetPassword", verifyToken, authorizeUser, resetPassword);

// products routes
// router.post("/addProducts", verifyToken, authorizeUser, addProduct)


export default router;














module.exports = router;
