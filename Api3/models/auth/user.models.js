"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator = require("validator");
const constants_1 = require("../../constants");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const bcrypt = require("bcryptjs");
const userSchema = new mongoose_1.default.Schema({
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
        default: function () {
            const userName = this.userName || 'default';
            return {
                url: `https://api.dicebear.com/6.x/pixel-art/svg?seed=${userName}&background=%23000000&radius=50&colorful=1`,
                localPath: "",
            };
        },
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
        enum: Object.values(constants_1.Roles),
        default: constants_1.Roles.User,
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
}, { timestamps: true });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        this.password = yield bcrypt.hash(this.password, 10);
        next();
    });
});
userSchema.methods.validatePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(password, this.password);
    });
};
userSchema.methods.generateAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            id: this._id,
            email: this.email,
            userName: this.userName,
            role: this.roles,
        };
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.JWT_EXPIRY
        });
    });
};
userSchema.methods.generateRefreshToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            id: this._id
        };
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRY
        });
    });
};
userSchema.methods.generateTemporaryToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // const unHashedToken
        return jsonwebtoken_1.default.sign({ id: this._id }, process.env.JWT_EMAIL_TOKEN_SECRET, {
            expiresIn: process.env.JWT_EMAIL_EXPIRY
        });
    });
};
const User = mongoose_1.default.models.user || mongoose_1.default.model('User', userSchema);
exports.default = User;
