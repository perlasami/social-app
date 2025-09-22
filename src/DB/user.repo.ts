import { FlattenMaps, HydratedDocument, Model, QueryOptions } from "mongoose";
import { IUser, userModel } from "../models/userModel";
import { DBRepo } from "./DBRepo";
import { ProjectionFields } from "mongoose";


export class UserRepo extends DBRepo<IUser>{
    constructor(protected override readonly model:Model<IUser>=userModel){
        super(model)
    }
    findByEmail = async ({ email, projection, options }: 
  { email: string; projection?: ProjectionFields<IUser>; options?: QueryOptions }
): Promise<FlattenMaps<HydratedDocument<IUser>> | HydratedDocument<IUser> | null> => {
  const query = this.model.findOne({ email }, projection, options);
  if (options?.lean) {
    query.lean();
  }
  const user = await query.exec();
  return user;
}


}