// express imports
const express = require("express");
require("express-async-errors");
const app = express();
import { errorHandler } from "./middleware/error.middleware";

// database connect
import { dbConnect } from "./config/dbConnect";
// .env imports
require("dotenv").config();
const { PORT } = process.env;

// middleware imports
const cookiParser = require("cookie-parser");
import bodyParser from "body-parser";
import { logger } from "./middleware/requestlogger.middleware";
const cors = require("cors");

// routes imports
import router from "./rotutes/auth/user.routes";
import { verifyToken } from "./middleware/verifyToken.middleware";
import { swaggerDocs } from "./utils/swagger/swagger";
import { todoRouter } from "./rotutes/todos/todos.routes";
// custom middlewares used to log the request 
app.use(logger);
const whitelist = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://www.google.com/",
];
const corsOptions = {
    origin: (origin: any, callback: any) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
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
app.use(express.static("public"))
// data from url{extended help in  reading object inside object}
app.use(express.urlencoded({ extended: true }));
// not required now
app.use(bodyParser.json());
// for cookie reading
app.use(cookiParser());
// versioning of api auth series
app.use("/api/v1/auth", router);
// versioning of api todo series
app.use("/api/v1/todo", verifyToken, todoRouter);
const start = async () => {
    try {
        await dbConnect();
        app.listen(PORT || 8001, () => {
            console.log(`app is listening on Port ${PORT}`);
        });
        swaggerDocs(app, Number(PORT))
    } catch (error) {
        console.log("Issue while starting app");
    }
};
start();
app.use(errorHandler);