import User from "../../models/userSchema";
const bcryptjs = require("bcryptjs");

exports.signup = async (req: any, res: any) => {
    try {
        // get data from body
        const { username, email, password, confirmPassword, accountType } = req.body;
        // verify every required fields are present or not
        if (!username || !email || !password || !confirmPassword) {
            return res.status(422).json({
                success: false,
                message: "Please fill all required fields",
                body: req.body
            })
        }
        // validate password
        if (password != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirmpassword should have same value."
            })
        }
        // check for Existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(402).json({
                success: false,
                message: "User already exists with this email"
            })
        }
        // hashed password
        const hashedPassword = await bcryptjs.hash(password, 10)
        // create user
        const newUser = await User.create({
            username, email, password: hashedPassword, image: `
        //       https://api.dicebear.com/6.x/pixel-art/svg?seed=${username}`, accountType
        })
        res.status(200).json({
            success: true,
            message: "User created successfully",
            user: newUser
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Enable to create User",
            error: error
        })
    }

}