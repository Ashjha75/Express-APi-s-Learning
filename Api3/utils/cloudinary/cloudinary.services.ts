import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localPath: any) => {
    try {
        if (!localPath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto",

        })
        console.log("File is uploaded on cloudinary", (await response).url);
        return response.url;
    } catch (error: any) {
        // if file is not uploaded on server but is present on owr local server we try to unlink it
        fs.unlinkSync(localPath);
        console.log("error while uploading");
        return null;
    }
}
export { uploadOnCloudinary }