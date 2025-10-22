import mongoose, { models, Schema } from "mongoose";
import { model } from "mongoose";
import { HydratedDocument, Types } from "mongoose";


export interface IMessage {
  createdBy: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HMessageDocument = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>({
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: true
  }
},{
    timestamps:true
});

export interface IChat {
  // OVO => one to one
  participants: Types.ObjectId[];
  message: IMessage[];
  // OVM => one to many
  group?: string;
  groupeImage: string;
  roomId: string;
  // common
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type HChatDocument = HydratedDocument<IChat>;


const chatSchema = new Schema<IChat>({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }],
  message: [messageSchema],
  group: String,
  groupeImage: String,
  roomId: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: true
});

export const ChatModel= models.chat || model<IChat>('chat',chatSchema)