const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    }
    ,
    password: {
        type: String,
        required: true
    }, image: {
        type: String
    },

    accountType: {
        type: String,
        enum: ["ADMIN", "USER", "SERVICE"]
    },

})

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;

// exports.signup = async (req, res) => {
//     try {
//         const {
//             firstName,
//             lastName,
//             email,
//             password,
//             confirmPassword,
//             accountType,
//             contactNumber,
//             otp,
//         } = req.body;

//         if (
//             !firstName ||
//             !lastName ||
//             !email ||
//             !password ||
//             !confirmPassword ||
//             !otp
//         ) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Please fill required fields.",
//             });
//         }

//         if (password !== confirmPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "password and confirmPassword should have same value.",
//             });
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(402).json({
//                 success: false,
//                 message: "User already exists with this email.",
//             });
//         }

//         // find most recent OTP stored for  the user
//         const mostRecentOtp = await Otp.findOne({ email })
//             .sort({ createdAt: -1 })
//             .limit(1);

//         // validate otp
//         if (mostRecentOtp.length == 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "OTP  FOUND.",
//             });
//         } else if (otp !== mostRecentOtp.otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "OTP NOT VALID OR FOUND.",
//             });
//         }
//         // hashed password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // create profile for additionalDetails
//         const profileDetails = await Profile.create({
//             gender: null,
//             dateOfBirth: null,
//             about: null,
//             contactNumber: null,
//         });
//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             contactNumber,
//             passwprd: hashedPassword,
//             accountType,
//             additionalDetails: profileDetails._id,
//             image: `
//       https://api.dicebear.com/6.x/pixel-art/svg?seed=${firstName} ${lastName}`,
//         });
//         res.status(200).json({
//             success: false,
//             message: "User is registerd  successfully",
//             error: err.message,
//         });
//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: "User can't be registerd Please try again ",
//             error: err.message,
//         });
//     }
// };
