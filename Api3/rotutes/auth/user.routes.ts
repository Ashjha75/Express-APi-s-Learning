const express = require("express");
import { Response } from "express";
// import { authorizeUser } from "../middlewares/authorizeUser.middlleware";
// import { verifyToken } from "../middlewares/verifyToken";
// import { addProduct } from "../controllers/productsControllers";
const router = express.Router();
const {
    register,
} = require("../../controllers/auth/authentication.controllers");

console.log(register);
// Authentication routes 
router.post("/signup", register);
// router.post("/login", login);
// router.post("/logout", logout);
// router.post("/resetPassword", verifyToken, authorizeUser, resetPassword);

// products routes
// router.post("/addProducts", verifyToken, authorizeUser, addProduct)


export default router;














module.exports = router;
