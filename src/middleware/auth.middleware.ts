import { HydratedDocument, ObjectId } from "mongoose"
import { UserRepo } from "../DB/user.repo"
import { IUser, userModel } from "../models/userModel"
import { ApplicationException, invalidTokenException, notConfirmed, NotFoundException } from "../utils/error"
import { verifyJwt } from "../utils/jwt"
import { Request,NextFunction,Response } from "express"

export enum tokenTypeEnum{
    access="access",
    refresh="refresh"
}

export interface Payload{
    id:string,
    iat:number,
    exp:number,
    jti:string

}

export interface IRequest extends Request{
    user:Partial<IUser>

}



const user=new UserRepo(userModel)

export const decodeToken= async ({authorization,tokenType=tokenTypeEnum.access}:{authorization?:string | undefined,tokenType?:tokenTypeEnum}):Promise<{user:HydratedDocument<IUser>,payload:Payload}>=>{
    if(!authorization){
        throw new invalidTokenException()
    }
    if(!authorization.startsWith(process.env.bearer_key as string)){
        throw new invalidTokenException()
    }
    const token=authorization.split(" ")[1]
    if(!token){
        throw new invalidTokenException()
    }
    const payload=verifyJwt({
        token,
        secret:tokenType==tokenTypeEnum.access?
        process.env.user_access_signature as string:
        process.env.user_refresh_signature as string
    })

    const user=await userModel.findById(payload.id)
    if(!user){
        throw new  NotFoundException("user not found")
    }
    if(!user.confirm){
        throw new notConfirmed()
    }
    if(user.isCredentialsUpdated.getTime()<= payload.iat *1000){
        throw new ApplicationException("please login again",409)
    }
    return {user,payload}

}

export const auth = () => {
  return async (req: IRequest, res: Response, next: NextFunction) => {
    const {user,payload} = await decodeToken({ authorization: req.headers.authorization  });
    res.locals.user=user;
    res.locals.payload=payload;
    next();
  };
};