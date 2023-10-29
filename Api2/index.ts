// express imports
const express = require("express");
require("express-async-errors");
const app = express();

// database connect
import { dbConnect } from "./config/connectDb";
// .env imports
require("dotenv").config();
const { PORT } = process.env;

// middleware imports
const cookiParser = require("cookie-parser");
import bodyParser from "body-parser";
import { logger } from "./middlewares/logEvents.middleware";
const cors = require("cors");

// routes imports
const authRouter = require("./routes/authRouter");
// middlewares used
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
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiParser());

app.use("/api/v1/auth", authRouter);

const start = async () => {
  try {
    await dbConnect();
    app.listen(PORT || 8001, () => {
      console.log(`app is listening on Port ${PORT}`);
    });
  } catch (error) {
    console.log("Issue while starting app");
  }
};
start();
