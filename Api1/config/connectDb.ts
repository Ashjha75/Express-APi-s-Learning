const mongoose = require("mongoose")
require('dotenv').config()
let isConnected = false;
export const connectDb = async () => {
    mongoose.set('strictQuery', true)
    if (!process.env.DATABASE_URL) return console.log("DATABASE_URL not found");
    if (isConnected) return console.log("Already connected to DB");
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        isConnected = true; console.log("connected to DB");
    } catch (error) {
        console.log(error);
    }
}