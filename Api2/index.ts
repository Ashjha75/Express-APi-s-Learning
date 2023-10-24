
// express imports 
const express = require("express");
const app = express();

// database connect
import { dbConnect } from "./config/connectDb";
// .env imports
require("dotenv").config();
const { PORT, DTABASE_URL } = process.env;
console.log(PORT)
// middleware imports
const cookiParser = require("cookie-parser");

// routes imports

console.log("first")

const start = async () => {
    try {
        await dbConnect();
        app.listen((PORT || 8000), () => { console.log(`app is listening on Port ${PORT}`) })

    } catch (error) {
        console.log("Issue while starting app")
    }
}
start();