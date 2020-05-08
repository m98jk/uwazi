import mongoose, { Schema, UpdateQuery, ModelUpdateOptions } from 'mongoose';
import { WithId, UwaziFilterQuery } from './models';

import { tenants } from './tenantContext';
import { getConnection } from './DB';

class MultiTenantMongooseModel<T> {
  dbs: { [k: string]: mongoose.Model<WithId<T> & mongoose.Document> };

  constructor(collectionName: string, schema: Schema) {
    this.dbs = {
      default: getConnection().model<WithId<T> & mongoose.Document>(collectionName, schema),
    };

    tenants.on('newTenant', tenantName => {
      this.dbs[tenantName] = getConnection()
        .useDb(tenantName)
        .model<WithId<T> & mongoose.Document>(collectionName, schema);
    });
  }

  findById(id: any | string | number, select = {}) {
    return this.dbs[tenants.current()].findById(id, select, { lean: true });
  }

  find(query: UwaziFilterQuery<T>, select = '', options = {}) {
    return this.dbs[tenants.current()].find(query, select, options);
  }

  async findOneAndUpdate(
    query: UwaziFilterQuery<T>,
    update: Readonly<Partial<T>> & { _id?: any },
    options: any = {}
  ) {
    return this.dbs[tenants.current()].findOneAndUpdate(query, update, options);
  }

  async create(data: Readonly<Partial<T>> & { _id?: any }) {
    return this.dbs[tenants.current()].create(data);
  }

  async _updateMany(
    conditions: UwaziFilterQuery<T>,
    doc: UpdateQuery<T>,
    options: ModelUpdateOptions = {}
  ) {
    return this.dbs[tenants.current()].updateMany(conditions, doc, options);
  }

  async findOne(conditions: UwaziFilterQuery<T>, projection: any) {
    return this.dbs[tenants.current()].findOne(conditions, projection);
  }

  async replaceOne(conditions: UwaziFilterQuery<T>, replacement: any) {
    return this.dbs[tenants.current()].replaceOne(conditions, replacement);
  }

  async countDocuments(query: UwaziFilterQuery<T> = {}) {
    return this.dbs[tenants.current()].countDocuments(query);
  }

  async distinct(field: string, query: UwaziFilterQuery<T> = {}) {
    return this.dbs[tenants.current()].distinct(field, query);
  }

  async deleteMany(query: UwaziFilterQuery<T>) {
    return this.dbs[tenants.current()].deleteMany(query);
  }

  async aggregate(aggregations?: any[]) {
    return this.dbs[tenants.current()].aggregate(aggregations);
  }

  async updateOne(conditions: UwaziFilterQuery<T>, doc: UpdateQuery<T>) {
    return this.dbs[tenants.current()].updateOne(conditions, doc);
  }
}

export { MultiTenantMongooseModel };
