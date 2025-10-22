
import { Response } from "express"
export const successHandler=({res,msg="Done",status=200,data={}}:{res:Response,msg?:string,status?:number,data?:object|null})=>{
    return res.status(status).json({
         msg,
         status,
        data


    })
   
}