import {
    FilterQuery,
    Model,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    UpdateWriteOpResult,
} from 'mongoose';

export abstract class MongoRepository<T> {
    protected constructor(private readonly model: Model<T>) {
        this.model = model;
    }

    async deleteMany(filter: FilterQuery<T>, options?: any): Promise<{ deletedCount: number }> {
        return this.model.deleteMany({ ...filter }, options).exec();
    }

    async deleteOne(filter: FilterQuery<T>, options?: any): Promise<{ deletedCount: number }> {
        return this.model.deleteOne({ ...filter }, options).exec();
    }

    async updateMany(
        filter?: FilterQuery<T>,
        update?: UpdateWithAggregationPipeline | UpdateQuery<T>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.model.updateMany({ ...filter }, update, options).exec();
    }

    async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: any): Promise<UpdateWriteOpResult> {
        return this.model.updateOne({ ...filter }, update, options).exec();
    }

    async create(doc: T | any): Promise<T> {
        return this.model.create(doc);
    }

    async findOneAndUpdate(filter: FilterQuery<T>, update?: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T> {
        return this.model.findOneAndUpdate({ ...filter }, update, options).exec();
    }

    async findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T> {
        return this.model.findById(id, projection, options).exec();
    }

    async findOne(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T> {
        return this.model.findOne({ ...filter }, projection, options).exec();
    }

    async findAll(filter?: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]> {
        return this.model.find({ ...filter }, projection, options).exec();
    }

    async insertMany(docs: T[] | any[]) {
        return this.model.insertMany(docs);
    }

    async collectionDrop() {
        return this.model.collection.drop();
    }
}
