import {
    Model,
    AggregateOptions,
    PipelineStage,
    InsertManyOptions,
    QueryOptions,
    FilterQuery,
    ProjectionType,
    UpdateQuery,
    Types,
} from 'mongoose';
import { AcceptAny } from '../interface/type';

export default class BaseEntity {
    protected model: Model<AcceptAny>;
    constructor(mongoModel: Model<AcceptAny>) {
        this.model = mongoModel;
    }

    ObjectId(id?: string) {
        return new Types.ObjectId(id);
    }

    async saveData<Type>(data: Type) {
        try {
            console.log(data, "were here in save data ")
            // return await new this.model(data).save();
            return await new this.model(data).save()

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async insertMany<Type>(data: Type, options: InsertManyOptions) {
        try {
            return await this.model.insertMany(data, options);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async distinct<Type>(field: string, query: FilterQuery<AcceptAny>) {
        try {
            return await this.model.distinct(field, query);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async find(
        query: FilterQuery<AcceptAny>,
        projection: ProjectionType<AcceptAny>,
        options: QueryOptions
    ) {
        try {
            return await this.model.find(query, projection, options).exec();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async findOne(
        query: FilterQuery<AcceptAny>,
        projection: ProjectionType<AcceptAny>,
        options?: QueryOptions
    ) {
        try {
            if (options != undefined) {
                options['lean'] = true;
            } else {
                options = { lean: true };
            }
            return await this.model.findOne(query, projection, options).exec();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async findOneAndUpdate(
        conditions: FilterQuery<AcceptAny>,
        update: UpdateQuery<AcceptAny>,
        options: QueryOptions
    ) {
        try {
            if (options != undefined) {
                options['writeConcern'] = { w: 'majority', wtimeout: 5000 };
            } else {
                options = { writeConcern: { w: 'majority', wtimeout: 5000 } };
            }
            return await this.model.findOneAndUpdate(conditions, update, options).exec();
        } catch (error) {
            return Promise.reject(error);
        }
    }


    paginationPipeline(page?: number, limit?: number) {
        const paginationQuery = [];
        if (page && limit) {
            paginationQuery.push({ $skip: (page - 1) * limit }, { $limit: limit });
        } else {
            paginationQuery.push({ $skip: 0 });
        }

        const pipeline = [
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    rows: paginationQuery,
                },
            },
            {
                $unwind: {
                    path: '$total',
                    preserveNullAndEmptyArrays: false,
                },
            },
        ];

        return pipeline;
    }

    async updateOne(
        query: FilterQuery<AcceptAny>,
        update: UpdateQuery<AcceptAny>,
        options: QueryOptions
    ) {
        try {
            return await this.model.updateOne(query, update, options).exec();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateMany(
        query: FilterQuery<AcceptAny>,
        update: UpdateQuery<AcceptAny>,
        options: QueryOptions
    ) {
        try {
            return await this.model.updateMany(query, update, options).exec();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async deleteMany(query: FilterQuery<AcceptAny>) {
        try {
            return await this.model.deleteMany(query);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
