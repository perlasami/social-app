import router from "./userModule/user.controller";
import { Router } from "express";
const baseRouter=Router()

baseRouter.use("/users",router)


export default baseRouter