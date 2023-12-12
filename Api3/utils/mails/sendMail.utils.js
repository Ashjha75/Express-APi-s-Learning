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
exports.forgotPasswordMailgenContents = exports.emailVerificationMailgenContents = exports.sendMail = void 0;
const mailgen_1 = __importDefault(require("mailgen"));
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv").config();
const sendMail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Initialise the mailgen instance with default theme and brand configurations
    const mailGenerator = new mailgen_1.default({
        theme: "default",
        product: {
            name: "Any",
            link: "Any.com"
        }
    });
    // 2. Generate a plain text version of email for those client which doesn't support html
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
    // 3. Generate a html version
    const emailHtml = mailGenerator.generate(options.mailgenContent);
    // 4. Create a nodemailer instances which sen the mail
    const transporter = yield nodemailer_1.default.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });
    const mail = {
        from: process.env.MAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml
    };
    try {
        yield transporter.sendMail(mail);
    }
    catch (error) {
        // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
        // So it's better to fail silently rather than breaking the app
        console.log("Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file");
        console.log("Error: ", error);
    }
});
exports.sendMail = sendMail;
const emailVerificationMailgenContents = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email please click on the following button:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};
exports.emailVerificationMailgenContents = emailVerificationMailgenContents;
const forgotPasswordMailgenContents = (username, resetUrl) => {
    return {
        body: {
            name: username,
            intro: "You have received this email because a password reset request for your account was received.",
            action: {
                instructions: "Click on the following button to reset your password:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Reset your password",
                    link: resetUrl,
                },
            },
            outro: "If you did not request a password reset, no further action is required on your part.",
        },
    };
};
exports.forgotPasswordMailgenContents = forgotPasswordMailgenContents;
