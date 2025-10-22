import { postRouter, userRouter } from "./modules";
import { Router } from "express";
import  chatRouter  from "./modules/chatModule/chat.controller";
const baseRouter=Router()

baseRouter.use("/users",userRouter)
baseRouter.use("/posts",postRouter)
baseRouter.use('/chats',chatRouter)


export default baseRouter