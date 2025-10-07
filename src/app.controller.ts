import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import baseRouter from "./routes";
import { ApplicationException, IError } from "./utils/error";
import { ConnectDB } from "./DB/db.connection";
import { promisify } from "util";
import { pipeline } from "stream";
import { createGetPresignedUrl, deleteFile, deleteFiles, getFile } from "./utils/multer/s3.services";
import { UserEvents } from "./utils/Email/emailEvents";
import { UserRepo } from "./DB/user.repo";
import { userModel } from "./models/userModel";

const createS3WriteStreamPipe=promisify(pipeline)

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
    app.get("/upload/pre-signed/*path", async (req: Request, res: Response) => {
  const { downloadName, download } = req.query as {
    downloadName?: string;
    download?: string;
  };

  const { path } = req.params as unknown as { path: string[] };
  const Key = path.join("/");

  const url = await createGetPresignedUrl({
    Key,
    downloadName: downloadName as string,
    download: download as string,
  });

  return res.status(200).json({ message: "Done", url });
});
     app.get("/upload/*path", async (req: Request, res: Response) => {
        const {downloadName}=req.query
        const { path } = req.params as unknown as { path: string[] };
        const Key = path.join("/");
        const s3Response = await getFile({ Key });

        if (!s3Response?.Body) {
            throw new ApplicationException("Fail to get asset",409);
        }
        res.setHeader("content-type",`${s3Response?.ContentType}`)
        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment; filename=${downloadName}`);
}

        return await createS3WriteStreamPipe(
            s3Response.Body as NodeJS.ReadableStream,
            res
        );
});

app.get("/test-s3", async (req: Request, res: Response) => {
  const { Key } = req.query as { Key: string };
  const results = await deleteFile({ Key: Key as string });

  return res.status(200).json({ message: "Done", results });
});

app.get("/test", async (req: Request, res: Response) => {
  const results = await deleteFiles({
    urls: [
      "SCIOAL_APP/users/68d5835fcb63deba084c23c2/5c0bf457-412c-41f3-8e2d-7f4ae5f6de03-file1.jpg",
      "SCIOAL_APP/users/68d5835fcb63deba084c23c2/fd9e07bd-ce73-45dd-9deb-0ab25bb4243c-file2.jpg",
    ],
  });

  return res.status(200).json({ message: "Done", results });
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


const test = async () => {
  try {
    const userModel = new UserRepo();
    const users = await userModel.find({ filter: { paraNoId: false } });
    if (users) {
      throw new Error("User found");
    }
    console.log({ users });
  } catch (error) {
    console.log({ error });
  }
};

    
    app.listen(port, () => {
        console.log("server running on port", port);
    });
};
