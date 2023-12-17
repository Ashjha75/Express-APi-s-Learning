import multer from "multer";
import { Request, Response } from 'express';
import { ApiError } from "../utils/errors/ApiError";


const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, './public/temp')
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png")
            cb(null, true);
        else
            cb(new ApiError(400, "Only .png, .jpg and .jpeg format allowed!", []))
    }
})


export { upload }
