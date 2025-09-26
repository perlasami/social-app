
import { Schema, model,HydratedDocument } from "mongoose";
import { boolean, maxLength, minLength, string } from "zod";
import { fa } from "zod/v4/locales";
import { ApplicationException } from "../utils/error";
import { createHash } from "../utils/hash";
import { emailEmitter } from "../utils/Email/emailEvents";

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
  isCredentialsUpdated:Date;
  profileImage:string;
  coverImage:string[];
  slug:string
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
    },slug:{
      type: String,
      required: true,
      minLength:3,
      maxLength:51
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
    },
    profileImage:{
      type:String
    },
    coverImage:[{
      type:String
    }]

    
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
userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.pre("validate", function (next) {
  console.log("Pre Hook", this);
  if (!this.slug?.includes("-")) {
    throw new ApplicationException(
      "Slug is Required and must hold - like ex: first-name-last-name",409
    );
  }
  next();
});

userSchema.pre("save", async function (this: HUserDocument & { wasNew: boolean }, next) {
  this.wasNew = this.isNew;
  console.log(this.wasNew);
  if (this.isModified("password")) {
    this.password = await createHash(this.password);
  }
  next();
});

userSchema.post("save", function (doc, next) {
  const that = this as HUserDocument & { wasNew: boolean };
  if (that.wasNew) {
    emailEmitter.publish("send-email-activation-code", { 
      to: this.email, 
      subject: "Confirm your email", 
      html: `<p>Your OTP is: 123465</p>` 
    });
  }
  next();
});

export type HUserDocument = HydratedDocument<IUser>;
export const userModel = model<IUser>("user", userSchema);
