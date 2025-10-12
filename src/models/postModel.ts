import { HydratedDocument, model, Schema } from "mongoose";
import mongoose,{Types} from "mongoose";
import { IPost, PostAvailabilityEnum } from "../modules/postModule/post.types";
import { IUser } from "./userModel";


export const availabilityCondition = (user: HydratedDocument<IUser>) => {
  return [
    {
      availability: PostAvailabilityEnum.PUBLIC
    },
    {
      availability: PostAvailabilityEnum.PRIVATE,
      createdBy: user._id
    },
    {
      availability: PostAvailabilityEnum.FRIENDS,
      createdBy: {
        $in: [...user.freinds, user._id]
      }
    },
    {
      availability: PostAvailabilityEnum.PRIVATE,
      tags: { $in: user._id }
    }
  ];
}





const postSchema = new Schema<IPost>({
  content: { type: String },
  attachments: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  availability: {
    type: String,
    enum: [PostAvailabilityEnum.PUBLIC, PostAvailabilityEnum.PRIVATE, PostAvailabilityEnum.FRIENDS],
    default: PostAvailabilityEnum.PUBLIC
  },
  allowsComments: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  assetsFolderId: { type: String },
}, {
  timestamps: true
});

export const postModel=model<IPost>("post",postSchema)