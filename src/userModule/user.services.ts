import { NextFunction, Request, Response } from "express";
import { ApplicationException, expiredOtpException, invalidCredentials, invalidOTPException, notConfirmed, NotFoundException, Notvalid_email, ValidationError } from "../utils/error";
import { SignupSchema, LoginSchema, confirmemailSchema, resendOtp, forgetPasswordSchema } from "./user.validation";
import { DBRepo } from "../DB/DBRepo";
import { IUser, userModel } from "../models/userModel";
import { HydratedDocument } from "mongoose";
import { UserRepo } from "../DB/user.repo";
import { compareHash, createHash } from "../utils/hash";
import { createOtp } from "../utils/Email/createOTP";
import z, { file, hash, success } from "zod";
import { template } from "../utils/Email/generateHtml";
import { emailEmitter } from "../utils/Email/emailEvents";
import { successHandler } from "../utils/successHandler";
import { createJwt } from "../utils/jwt";
import { nanoid } from "nanoid";
import { decodeToken } from "../middleware/auth.middleware";
import { tokenTypeEnum } from "../middleware/auth.middleware";
import { createPresignedUrl, uploadFile, uploadMultipleFile } from "../utils/multer/s3.services";


export type confirmemailDTO=z.infer<typeof confirmemailSchema>
export type resendOtpDTO=z.infer<typeof resendOtp>
export type loginDTO=z.infer<typeof LoginSchema>
export type forgetDTO=z.infer<typeof forgetPasswordSchema>
export interface AuthenticatedRequest extends Request {
  decoded?: {
    _id: string;
    jti?: string;
    [key: string]: any;
  };
}


interface Iuserservices {
    signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
    getUser(req: Request, res: Response, next: NextFunction):  Promise<Response>;
    login(req: Request, res: Response, next: NextFunction): Promise<Response>;
    confirmemail(req: Request, res: Response, next: NextFunction): Promise<Response>;
    resendOtp(req: Request, res: Response, next: NextFunction): Promise<Response>;
    login(req: Request, res: Response, next: NextFunction): Promise<Response>;
    //profileImage(req: Request, res: Response, next: NextFunction): Promise<Response>;
}

export class Userservices implements Iuserservices {
    private userModel=new UserRepo()
    constructor(){}
    async signup(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { email, password, firstName, lastName } = req.body;

    const result = await SignupSchema.safeParseAsync(req.body);

    const isExist = await this.userModel.findOne({
        filter: { email },
        options: { lean: true }
    });

    if (isExist) {
        throw new Notvalid_email();
    }

    const otp=createOtp()
    const html=template({code:otp,name:`${firstName} ${lastName}`,subject:"use this otp to confirm email"})
    emailEmitter.publish("send-email-activation-code",{to:email,subject:"use this otp to confirm email",html})

    const user: HydratedDocument<IUser> = await this.userModel.create({
        data: {
            email,
            firstName,
            password: await createHash(password),
            lastName,
            emailOtp:{
                otp:await createHash(otp),
                expireAt:new Date(Date.now()+5*60*1000)
            }
        }
    });

    return successHandler({res,data:user})
};




    getUser = async (req: Request, res: Response): Promise<Response> => {
            const user:IUser = res.locals.user;
            console.log({ user: res.locals.users });
            return successHandler({ res, data: user });
            };

        // async login(req: Request, res: Response, next: NextFunction): Promise<Response> {
        // const { email, password } = req.body;

        // if (!email || !password) {
        //     return res.status(400).json({ message: "Email and password are required" });
        // }

        // return res.status(200).json({
        //     message: "User Logged In Successfully",
        //     email: email,
        // });
        // }



        confirmemail=async(req: Request, res: Response, next: NextFunction): Promise<Response>=> {
            const {email,otp}:confirmemailDTO=req.body;
            const user=await this.userModel.findByEmail({email});
            if(!user){
                throw new NotFoundException("user not found")
            }
            if(user.confirm){
                throw new ApplicationException('you are already confirmed',409)

            }
            if(!user.emailOtp||user.emailOtp.expireAt.getTime()<= Date.now()){
                throw new expiredOtpException()
            }
              if(!await compareHash(otp,user.emailOtp.otp)){
                 throw new invalidOTPException()
  }
            user.confirm=true;
            user.emailOtp=undefined;
            await user.save()

            return successHandler({res})
            
        }

        resendOtp=async (req: Request, res: Response, next: NextFunction): Promise<Response>=> {
            const {email}=req.body as resendOtpDTO;
            const user=await this.userModel.findByEmail({email});
            if(!user){
                throw new NotFoundException("user not found")
            }
             if(user.confirm){
                throw new ApplicationException('you are already confirmed',409)

            }
            if(user.emailOtp && user.emailOtp.expireAt.getTime()>= Date.now()){
                throw new expiredOtpException("old otp didnt expired yet")
            }
            const otp=createOtp()
            const html=template({code:otp,name:`${user.firstName} ${user.lastName}`,subject:"resend the otp to confirm email"})
            emailEmitter.publish("send-email-activation-code",{to:email,subject:"resend the otp to confirm email",html})

            user.emailOtp={
                expireAt:new Date(Date.now()+5*60*1000),
                otp: await createHash(otp)
            };
            await user.save()
            return successHandler({res})
            
        }

     

      login=async (req: Request, res: Response, next: NextFunction): Promise<Response>=> {
        const{email,password}=req.body as loginDTO;
        const user=await this.userModel.findByEmail({email});
        if(!user || !await compareHash(password,user?.password)){
            throw new invalidCredentials()

        }
        if(!user.confirm){
                throw new notConfirmed()

            }
            const jti=nanoid()
        const accessToken:string=createJwt({
            id:user._id
        },process.env.user_access_signature as string,{
            jwtid:jti,
            expiresIn:"1 H"
        });
        const refreshToken:string=createJwt({
            id:user._id
        },process.env.user_refresh_signature as string,{
            jwtid:jti,
            expiresIn:"7 D"
        });
        return successHandler({res,data:{
            accessToken,
            refreshToken
        }})

    }

    refreshToken = async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  const { user, payload } = await decodeToken({ authorization, tokenType: tokenTypeEnum.refresh });
  const accessToken: string = createJwt(
    { id: user._id.toString() },
    process.env.user_access_signature as string,
    {
      jwtid: payload.jti,
      expiresIn: '1 H'
    }
  );
  return successHandler({
    res,
    data: {
      accessToken
    }
  });
};

forgetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email }: forgetDTO = req.body;
  const user = await this.userModel.findByEmail({ email });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.confirm) {
    throw new notConfirmed();
  }

  const otp = createOtp();
  const subject = "Use This otp to reset your password";
  const html = template({ code: otp, name: `${user.firstName} ${user.lastName}`, subject });
  emailEmitter.publish("send-reset-password-email", { to: email, subject, html });

  user.PsswordOtp = {
    otp: await createHash(otp),
    expireAt: new Date(Date.now() + 5 * 60 * 1000)
  };
  await user.save();

  return successHandler({ res });
};

resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp, password } = req.body;
  const user = await this.userModel.findByEmail({ email });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.PsswordOtp?.otp) {
    throw new ApplicationException('use forget password first', 409);
  }

  if (user.PsswordOtp.expireAt.getTime() <= Date.now()) {
    throw new expiredOtpException();
  }
  if(!await compareHash(otp,user.PsswordOtp.otp)){
    throw new invalidOTPException()
  }

  await user.updateOne({
    password: await createHash(password),
    isCredentialsUpdated:new Date(Date.now()),
    $unset: {
      passwordOtp: ''
    }
  });

  return successHandler({ res });
};

profileImage = async (req: AuthenticatedRequest, res: Response) => {
  // console.log({file:req.file})
  // const user=res.locals.user as HydratedDocument<IUser>
  // const path=await uploadFile({
  //   File:req.file as Express.Multer.File,
  //   pathh:"profile-image"
  // })
  // user.profileImage=path
  // await user.save()
  // successHandler({res,data:{path}})

const {
  ContentType,
  originalname,
}: { ContentType: string; originalname: string } = req.body;

const { url, Key } = await createPresignedUrl({
  ContentType,
  originalname,
  pathh: `users/${req.decoded?._id}`,
});

return res
  .status(200)
  .json({ message: "Profile Image Uploaded Successfully", url, Key });
}

coverImages = async (req: Request, res: Response) => {
  const user = res.locals.user as HydratedDocument<IUser>;
  const paths = await uploadMultipleFile({
    Files: req.files as Express.Multer.File[],
    pathh: "coverImages"
  });
  user.coverImage = paths;
  await user.save();
  successHandler({ res, data: paths });
}





}
