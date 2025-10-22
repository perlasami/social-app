import { Model } from "mongoose";
import { DBRepo } from "../../DB/DBRepo";
import { IPost } from "./post.types";
import { postModel } from "../../models/postModel";

export class PostRepo extends DBRepo<IPost> {
  constructor(protected override readonly model: Model<IPost> = postModel) {
    super(model);
  }
}