const mongoose = require("mongoose");
const validator = require("validator");


const userModel = new mongoose.Schema({
    username: {
        type: String,
        require: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username should contain atleast 3 characters"],
        maxlength: [50, "Username should be not more than 50 characters"]
    },
    email: {
        type: String,
        require: [true, "Email is required"],
        unique: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide valid email",
        },
    },
    password: {
        type: String,
        trim: true,
        require: [true, "Password is required"],
    },
    roles: {
        type: String,
        enum: ["USER", "ADMIN", "SERVICE"],
        default: "USER"
    },
    onboarded: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.models.user || mongoose.model("user", userModel);
export default User;