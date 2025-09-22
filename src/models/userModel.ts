import { createHash } from "crypto";
import { Schema, model,HydratedDocument } from "mongoose";
import { boolean } from "zod";
import { fa } from "zod/v4/locales";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  emailOtp: {
    otp: string;
    expireAt: Date;
  }|undefined;
    PsswordOtp: {
    otp: string;
    expireAt: Date;
  };
  phone: string;
  confirm:Boolean;
  isCredentialsUpdated:Date
}
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      // set:async function(value:string):promise<string>{
      //   return await createHash(value)
      // }
    },
    emailOtp: {
      otp:  String ,
      expireAt:  Date ,
    },
    PsswordOtp: {
      otp:  String ,
      expireAt:  Date ,
    },
    phone: {
      type: String,
    },
    confirm:{
      type:Boolean,
      default:false

    },
    isCredentialsUpdated:{
      type:Date,
    }
    
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const userModel = model<IUser>("user", userSchema);
