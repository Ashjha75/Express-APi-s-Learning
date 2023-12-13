const express = require("express");
import { Request, Response } from "express";
import { verifyToken } from "../../middleware/verifyToken.middleware";
// import { authorizeUser } from "../middlewares/authorizeUser.middlleware";
// import { verifyToken } from "../middlewares/verifyToken";
// import { addProduct } from "../controllers/productsControllers";
const router = express.Router();
const {
    register, login, logout, verifyEmail, resendEmailVerification, refreshToken, forgotPasswordRequest, resetForgotPassword, changePassword, assignRole
} = require("../../controllers/auth/authentication.controllers");

router.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Deployed Successfully"
    })
})
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
