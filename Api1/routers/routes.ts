const express = require("express");
const router = express.Router();
const { signup } = require("../controllers/Auths/sign-up")
const { signin } = require("../controllers/Auths/sign-in")
router.post("/signup", signup);
router.post("/signin", signin);


module.exports = router