import { NextFunction, Request } from "express";
import { format } from "date-fns"; // import format from date-fns
import { v4 as uuid } from "uuid";
// import {logs} from "../libs"
const fs = require("fs");
const path = require("path");
const fsPromises = require("fs").promises;
import { EventEmitter } from "events";
// import ExcelJS from "exceljs";

export const logEvents = async (
  message: string,
  logName: string,
  urlPath: string,
  status: number
) => {
  const dateTime = `${format(new Date(), "yyyy/MM/dd\tHH:mm:ss")}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\t${urlPath}\t\t${status}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "../libs", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "../libs", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "../libs", "logs", logName),
      logItem
    );
  } catch (error: any) {
    console.log(error.message);
  }
};
// const logEvents = async (message: string, logName: string, url: string) => {
//   const dateTime = `${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`;
//   const logItem = { dateTime, uuid: uuid(), message, url };

//   try {
//     if (!fs.existsSync(path.join(__dirname, "../logs"))) {
//       await fsPromises.mkdir(path.join(__dirname, "../logs"));
//     }

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Logs");

//     worksheet.columns = [
//       { header: "Date Time", key: "dateTime", width: 20 },
//       { header: "UUID", key: "uuid", width: 36 },
//       { header: "Message", key: "message", width: 50 },
//       { header: "URL", key: "url", width: 50 },
//     ];

//     worksheet.addRow(logItem);

//     await workbook.xlsx.writeFile(path.join(__dirname, "../logs", logName));
//   } catch (error: any) {
//     console.log(error.message);
//   }
// };
interface ApiResonse extends Response, EventEmitter {
  statusCode: number;
}
// logger middleware
export const logger = async (
  req: Request,
  res: ApiResonse,
  next: NextFunction
) => {
  res.on("finish", () => {
    const status = res.statusCode;
    const message = `${req.method}\t${req.headers.origin}`;
    const url = req.originalUrl;
    logEvents(message, "reqLog.txt", url, status);
  });
  next();
};
