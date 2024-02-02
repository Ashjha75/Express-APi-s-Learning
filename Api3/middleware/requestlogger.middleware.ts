import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs"
import path from "path";
import fsPromise from "fs/promises"
import { EventEmitter } from "events";
import { NextFunction, Request, Response } from "express";


export const logRequest = async (
    message: string,
    logName: string,
    urlPath: string,
    status: number,
    referrer: string,
    userAgent: string,
    ipAdd: any,
) => {
    const dateTime = `${format(new Date(), "yyyy/MM/dd\tHH:mm:ss")}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\t${urlPath}\t\t\t${referrer}\t${userAgent}\t${ipAdd}\t${status}\n`;

    try {
        const logPath = path.join(__dirname, "../utils", "authLogs", logName)
        // check if logs folder not exists
        //if not create it
        if (!fs.existsSync(logPath)) {
            const header = 'Date\t\tUUID\t\tMessage\t\tPath\t\tReferrer\t\tUser-Agent\t\tIPAdd\t\tStatus\n';
            // await fsPromise.mkdir(path.join(__dirname, "../utils", "authLogs"));
            await fsPromise.writeFile(logPath, header)
        }

        // check if logs folder exists
        // append logItem to log file
        await fsPromise.appendFile(logPath, logItem);

    } catch (error: any) {
        console.log(error.message)

    }

}


const logger = async (req: Request, res: Response, next: NextFunction) => {

    res.on("finish", () => {
        const statusCode = res.statusCode;
        const referrer = req.headers.referer || '';
        const userAgent = req.headers['user-agent'] || '';
        const message = `${req.method}\t${req.headers.origin}`;
        const url = req.originalUrl;
        const ipAdd = req?.headers["ForwardedFor"] ?? req?.socket.remoteAddress;
        console.log(url.includes("/auth"))
        if (url.includes("/auth")) {
            logRequest(message, "authReq.log", url, statusCode, referrer, userAgent, ipAdd)
        }
    })
    next();
}
export { logger }