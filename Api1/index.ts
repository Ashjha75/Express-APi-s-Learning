import { connectDb } from "./config/connectDb";

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const routes = require("./routers/routes")
app.use(bodyParser());
app.use(cookieParser());
app.use(cors());

app.get("/", (req: any, res: any) => {
    res.status(200).json({ port: `${PORT}` });
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
app.use("/api/v1/", routes);
connectDb()