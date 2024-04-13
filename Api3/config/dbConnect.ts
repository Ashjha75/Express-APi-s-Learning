import mongoose from "mongoose";
require("dotenv").config();
export const dbConnect = async () => {
    // which means that only fields defined in the Mongoose model schema will be included in queries
    mongoose.set('strictQuery', true);
    mongoose.set('debug', false);
    let isConnected = false;
    let dbInstance = undefined;
    if (!process.env.DATABASE_URL) {
        console.log("DATABASE_URL is Missing")
        return
    }
    if (isConnected) {
        return;
    }
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        isConnected = true
        console.log("SuccesFully Connected to Db");
    } catch (error: any) {
        console.log("Error while connected to Database")
        process.exit(1);
    }
}
