import { postRouter, userRouter } from "./modules";
import { Router } from "express";
const baseRouter=Router()

baseRouter.use("/users",userRouter)
baseRouter.use("/posts",postRouter)


export default baseRouter