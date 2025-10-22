"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("./modules");
const express_1 = require("express");
const chat_controller_1 = __importDefault(require("./modules/chatModule/chat.controller"));
const baseRouter = (0, express_1.Router)();
baseRouter.use("/users", modules_1.userRouter);
baseRouter.use("/posts", modules_1.postRouter);
baseRouter.use('/chats', chat_controller_1.default);
exports.default = baseRouter;
