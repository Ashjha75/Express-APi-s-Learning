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
// express imports
const express = require("express");
require("express-async-errors");
const app = express();
const error_middleware_1 = require("./middleware/error.middleware");
// database connect
const dbConnect_1 = require("./config/dbConnect");
// .env imports
require("dotenv").config();
const { PORT } = process.env;
// middleware imports
const cookiParser = require("cookie-parser");
const body_parser_1 = __importDefault(require("body-parser"));
// import { logger } from "./middlewares/logEvents.middleware";
const cors = require("cors");
// routes imports
const user_routes_1 = __importDefault(require("./rotutes/auth/user.routes"));
const swagger_1 = require("./utils/swagger/swagger");
// custom middlewares used to log the request 
// app.use(logger);
const whitelist = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://www.google.com/",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: 200,
};
// app.use(cors(corsOptions));
app.use(cors());
// data from body
app.use(express.json({ limit: '16kb' }));
// for storing datas in public folder
app.use(express.static("public"));
// data from url{extended help in  reading object inside object}
app.use(express.urlencoded({ extended: true }));
// not required now
app.use(body_parser_1.default.json());
// for cookie reading
app.use(cookiParser());
// versioning of api auth series
app.use("/api/v1/auth", user_routes_1.default);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, dbConnect_1.dbConnect)();
        app.listen(PORT || 8001, () => {
            console.log(`app is listening on Port ${PORT}`);
        });
        (0, swagger_1.swaggerDocs)(app, Number(PORT));
    }
    catch (error) {
        console.log("Issue while starting app");
    }
});
start();
app.use(error_middleware_1.errorHandler);
