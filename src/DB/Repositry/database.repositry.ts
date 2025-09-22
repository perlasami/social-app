import{CreateOptions, FilterQuery,ProjectionType,QueryOptions,UpdateQuery,MongooseUpdateQueryOptions,Model} from "mongoose"

export abstract class DatabaseRepository<T> {
    constructor(protected readonly model: Model<T>) {}
    
    async findOne({
        filter,
        select,
        options
    }: {
        filter: FilterQuery<T>,
        select?: ProjectionType<T> | null,
        options?: QueryOptions<T>
    }): Promise<T | null> {
        return await this.model.findOne(filter, select, options).exec();
    }

    async createOne({
        data,
        options
    }: {
        data: Partial<T>,
        options?: CreateOptions
    }): Promise<T[]> { 
        return await this.model.create([data], options);
    }

    async createMany({
        data,
        options
    }: {
        data: Partial<T>[],
        options?: CreateOptions
    }): Promise<T[]> { 
        return await this.model.create(data, options);
    }

    async updateOne({
        filter,
        update,
        options
    }: {
        filter: FilterQuery<T>,
        update: UpdateQuery<T>,
        options?: MongooseUpdateQueryOptions
    }): Promise<T | null> { 
        return await this.model.findOneAndUpdate(filter, update, options).exec();
    }
}