import { FlattenMaps, Model, ObjectId } from "mongoose";
import { IUser } from "../models/userModel";
import { HydratedDocument, FilterQuery,ProjectionFields,QueryOptions} from "mongoose";
export abstract class DBRepo<T> {
  constructor(protected readonly model: Model<T>) { }

  create = async ({ data }: { data: Partial<T> }): Promise<HydratedDocument<T>>=> {
    const doc = await this.model.create(data)
    return doc
  }
      find = async (
        filter: FilterQuery<T> = {},
        projection?: any,
        options?: QueryOptions
    ): Promise<HydratedDocument<T>[]> => {
        return this.model.find(filter, projection, options).exec();
    };

  findOne = async ({ filter, projection, options }: 
  { filter: FilterQuery<T>, projection?: ProjectionFields<T>, options?: QueryOptions }): Promise<FlattenMaps<HydratedDocument<T>> |HydratedDocument<T> | null> => {
  const query =  this.model.findOne(
    filter,
    projection,
    options
  )
  if(options?.lean){
    query.lean()
  }
  const doc=await query.exec()
  return doc
}

  findById = async ({ id, projection, options }: 
  { id: string, projection?: ProjectionFields<T>, options?: QueryOptions }): Promise<FlattenMaps<HydratedDocument<T>> |HydratedDocument<T> | null> => {
  const query =  this.model.findById(
    id,
    projection,
    options
  )
  if(options?.lean){
    query.lean()
  }
  const doc=await query.exec()
  return doc
}
}
