import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import baseRouter from "./routes";
import { IError } from "./utils/error";
import { ConnectDB } from "./DB/db.connection";
dotenv.config({
    path: path.resolve("./src/config/.env")
});

const app: Express = express();


export const bootstrap = async () => {
    const port = process.env.PORT || "3000";
    await ConnectDB()

    
    app.use(express.json());

   
    app.use("/api/v1", baseRouter);

    app.get("/", (req: Request, res: Response) => {
        res.json({ msg: "hello" });
    });

    
    app.use((req: Request, res: Response) => {
        res.status(404).json({ msg: "Route not found" });
    });

    
    app.use((err: IError, req: Request, res: Response, next: NextFunction): Response => {
        return res.status(500).json({
            errMsg: err.message,
            status: (err as any).cause || 500,
            stack: err.stack
        });
    });

    
    app.listen(port, () => {
        console.log("server running on port", port);
    });
};
