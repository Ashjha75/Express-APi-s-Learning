
// express imports 
const express = require("express");
const app = express();

// database connect
import { dbConnect } from "./config/connectDb";
// .env imports
require("dotenv").config();
const { PORT } = process.env;
console.log(PORT)
// middleware imports
const cookiParser = require("cookie-parser");
import bodyParser from "body-parser";

// routes imports
const authRouter = require("./routes/authRouter")

// middlewares used 
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiParser());


app.use("/api/v1/auth", authRouter)

const start = async () => {
    try {
        await dbConnect();
        app.listen((PORT || 8000), () => { console.log(`app is listening on Port ${PORT}`) })

    } catch (error) {
        console.log("Issue while starting app")
    }
}
start();