import { Request, Response } from "express";


export const addProduct = async (req: Request, res: Response) => {
    try {
        const reqBody = req.body;
        console.log(reqBody);
        res.status(200).json({
            success: true,
            message: "Product added successfully",
            data: reqBody,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

}