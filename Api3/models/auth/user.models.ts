import mongoose from "mongoose";
const validator = require("validator");
import { Roles } from "../../constants";
import Jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
require("dotenv").config();
console.log("Roles", Roles)

const userSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username should contain atleast 3 characters"],
        maxlength: [50, "Username should be not more than 50 characters"],
        index: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide valid email",
        },
    },
    avatar: {
        type: {
            url: String,
            localPath: String,
        },
        default: {
            url: `https://api.dicebear.com/6.x/pixel-art/svg?seed={userName}&background=%23000000&radius=50&colorful=1`,
            localPath: "",
        }

    },
    password: {
        type: String,
        trim: true,
        required: [true, "Password is required"],
        minlength: [8, "Password should contain atleast 8 characters"],
        maxlength: [50, "Password should be not more than 50 characters"],
    },
    roles: {
        type: String,
        enum: Roles,
        default: Roles.USER,
        required: [true, "Role is required"],
    },
    onboarded: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        default: ""
    },
    emailVerificationToken: {
        type: String,
        default: ""
    },
    emailVerificationTokenExpiresAt: {
        type: Date,
    },
    forgotPasswordToken: {
        type: String,
        default: ""
    },
    forgotPasswordTokenExpiresAt: {
        type: Date,
    },
},

    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcryptjs.hash(this.password, 10)
    next();
});

userSchema.methods.validatePassword = async function (password) {
    return await bcryptjs.compare(password, this.password!)
}

userSchema.methods.generateAccessToken = async function () {
    const payload = {
        id: this._id,
        email: this.email,
        userName: this.userName,
        role: this.roles,
    }
    return Jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.JWT_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = async function () {
    const payload = {
        id: this._id
    }
    return Jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET!, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY
    })
}
const User = mongoose.models.user || mongoose.model('User', userSchema)
export default User;