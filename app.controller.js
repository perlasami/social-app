"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./utils/error");
const db_connection_1 = require("./DB/db.connection");
const util_1 = require("util");
const stream_1 = require("stream");
const s3_services_1 = require("./utils/multer/s3.services");
const user_repo_1 = require("./DB/user.repo");
const cors_1 = __importDefault(require("cors"));
const gateway_1 = require("./modules/gateway/gateway");
const createS3WriteStreamPipe = (0, util_1.promisify)(stream_1.pipeline);
dotenv_1.default.config({
    path: path_1.default.resolve("./src/config/.env")
});
const app = (0, express_1.default)();
const bootstrap = async () => {
    const port = process.env.PORT || "3000";
    await (0, db_connection_1.ConnectDB)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use("/api/v1", routes_1.default);
    app.get("/", (req, res) => {
        res.json({ msg: "hello" });
    });
    app.get("/upload/pre-signed/*path", async (req, res) => {
        const { downloadName, download } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await (0, s3_services_1.createGetPresignedUrl)({
            Key,
            downloadName: downloadName,
            download: download,
        });
        return res.status(200).json({ message: "Done", url });
    });
    app.get("/upload/*path", async (req, res) => {
        const { downloadName } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const s3Response = await (0, s3_services_1.getFile)({ Key });
        if (!s3Response?.Body) {
            throw new error_1.ApplicationException("Fail to get asset", 409);
        }
        res.setHeader("content-type", `${s3Response?.ContentType}`);
        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment; filename=${downloadName}`);
        }
        return await createS3WriteStreamPipe(s3Response.Body, res);
    });
    app.get("/test-s3", async (req, res) => {
        const { Key } = req.query;
        const results = await (0, s3_services_1.deleteFile)({ Key: Key });
        return res.status(200).json({ message: "Done", results });
    });
    app.get("/test", async (req, res) => {
        const results = await (0, s3_services_1.deleteFiles)({
            urls: [
                "SCIOAL_APP/users/68d5835fcb63deba084c23c2/5c0bf457-412c-41f3-8e2d-7f4ae5f6de03-file1.jpg",
                "SCIOAL_APP/users/68d5835fcb63deba084c23c2/fd9e07bd-ce73-45dd-9deb-0ab25bb4243c-file2.jpg",
            ],
        });
        return res.status(200).json({ message: "Done", results });
    });
    app.use((req, res) => {
        res.status(404).json({ msg: "Route not found" });
    });
    app.use((err, req, res, next) => {
        return res.status(500).json({
            errMsg: err.message,
            status: err.cause || 500,
            stack: err.stack
        });
    });
    const test = async () => {
        try {
            const userModel = new user_repo_1.UserRepo();
            const users = await userModel.find({ filter: { paraNoId: false } });
            if (users) {
                throw new Error("User found");
            }
            console.log({ users });
        }
        catch (error) {
            console.log({ error });
        }
    };
    const httpServer = app.listen(port, () => {
        console.log("server running on port", port);
    });
    (0, gateway_1.initialize)(httpServer);
};
exports.bootstrap = bootstrap;
