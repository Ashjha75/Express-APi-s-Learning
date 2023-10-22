import User from "../../models/userSchema";
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs")
require("dotenv").config()

exports.signin = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        // verify required fields 
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields "
            })
        }
        // check for existing user 
        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        const payload = {
            id: existingUser._id,
            email: existingUser.email,
            accountType: existingUser.accountType,
        }
        const options = {
            expiresIn: new Date(Date.now() + 3000),
            httpOnly: true,
            secure: true,
            path: "/"
        }
        // validate password
        if (await bcryptjs.compare(password, existingUser.password)) {
            // create jwt access-token

            let accessToken = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
            let refreshToken = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

            return res.cookie("access-token", accessToken, options).status(201).json({
                success: true,
                message: "Successfully Logged in",
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            })
        }
        // set access-token in cookies
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Issue while signin "
        })

    }
}