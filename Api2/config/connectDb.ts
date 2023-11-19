const mongoose = require("mongoose");
require("dotenv").config();

export const dbConnect = async () => {
    mongoose.set('strictQuery', true)
    let isConnected = false;
    if (!process.env.DATABASE_URL) {
        console.log("DATABASE_URL is Missing")
        return;
    }
    if (isConnected) {
        console.log("Already connected to Db");
        return;
    }
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        isConnected = true
        console.log("SuccesFully Connected to Db");

    } catch (error: any) {
        console.log("Error while connected to Database")
    }
}
