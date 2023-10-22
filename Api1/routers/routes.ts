const express = require("express");
const router = express.Router();
const { signup } = require("../controllers/Auths/sign-up")
const { signin } = require("../controllers/Auths/sign-in")
const { signout } = require("../controllers/Auths/sign-out")
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);


module.exports = router