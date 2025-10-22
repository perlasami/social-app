import mongoose, { model, Schema, Types } from "mongoose";



export interface IFreindReuest{
    from:Types.ObjectId,
    to:Types.ObjectId,
    acceptedAt:Date,
    createdAt:Date,
    updatedAt:Date
}

const friendRequestSchema = new Schema<IFreindReuest>({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  acceptedAt: Date
}, {
  timestamps: true
})

export const FriendRequestModel = model<IFreindReuest>('friendRequest',friendRequestSchema )