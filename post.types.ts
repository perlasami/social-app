import { HydratedDocument, Types } from "mongoose";

export enum PostAvailabilityEnum {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',
}

export interface IPost {
  content?: string | undefined;
  attachments?: string[]; // array of attachment paths (images)
  createdBy: Types.ObjectId;
  availability?: PostAvailabilityEnum;
  allowsComments: boolean;
  likes: Array<Types.ObjectId>; // array of user ids who liked the post
  tags: Array<Types.ObjectId>; // array of user ids who are tagged in the post
  isDeleted: boolean;
  assetsFolderId: string; // reference to the folder in which attachments are stored
  createdAt?: Date;
  updatedAt?: Date;
}

export type PostDocument = HydratedDocument<IPost>;