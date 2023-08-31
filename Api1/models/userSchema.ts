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
        required: true,
        min: [8, "Password should be atleast of 8 digits"]
    }, image: {
        type: String
    },

    accountType: {
        type: String,
        enum: { values: ["ADMIN", "USER", "SERVICE"], message: '{VALUE} is not supported' },
        default: ["USER"]
    },
    refreshToken: {
        type: String
    }

})

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;

