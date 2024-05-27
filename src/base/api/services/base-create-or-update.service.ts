/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { UpdateResult } from 'mongodb';

import { BaseListService } from '@base/api/services/base-list.service';

import { IExtraOptions } from './base.interface';


export class BaseCreateOrUpdateService<TDoc extends Document> extends BaseListService<TDoc> {
  /* Create Or Update */
  protected async preCreateOrUpdate(dto: Partial<TDoc>, oldRecord: TDoc, extraOptions?: IExtraOptions) {
    return dto;
  }

  protected async postCreateOrUpdate(record: TDoc, dto: Partial<TDoc>, oldRecord: TDoc, extraOptions?: IExtraOptions) {
    return record;
  }


  /* Create */
  protected async preCreate(dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    return this.preCreateOrUpdate(dto, null, extraOptions);
  }

  protected async postCreate(record: TDoc, dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    return this.postCreateOrUpdate(record, dto, null, extraOptions);
  }

  async create(dto: Partial<TDoc>, extraOptions: IExtraOptions = {}): Promise<TDoc> {
    const doc = await this.preCreate(dto, extraOptions);
    const record = await new this.model(doc).save();
    return this.postCreate(record, dto, extraOptions);
  }

  /* Upsert */

  /* Update */
  protected async preUpdateOne(record: TDoc, dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    return this.preCreateOrUpdate(dto, record, extraOptions);
  }

  protected async postUpdateOne(newRecord: TDoc, oldRecord: TDoc, dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    return this.postCreateOrUpdate(newRecord, dto, oldRecord, extraOptions);
  }

  async updateById(_id: string, dto: Partial<TDoc>, extraOptions: IExtraOptions = {}): Promise<TDoc> {
    return this.updateOneBy({ _id }, dto, extraOptions);
  }

  async updateOneBy(filter: FilterQuery<Partial<TDoc>>, dto: Partial<TDoc>, extraOptions: IExtraOptions = {}): Promise<TDoc> {
    let updateDto = dto;
    let oldRecord = null;

    if (extraOptions.updateOne?.includeOldRecord) {
      oldRecord = await this.getOneBy(filter, extraOptions);
      if (!oldRecord)
        return;
    }

    updateDto = await this.preUpdateOne(oldRecord, dto, extraOptions);

    const newRecord = await this.model.findByIdAndUpdate(filter, updateDto, { new: true });
    return this.postUpdateOne(newRecord, oldRecord, dto, extraOptions);
  }

  async findOneAndUpdate(filter: FilterQuery<Partial<TDoc>>, dto: UpdateQuery<TDoc>, options?: QueryOptions): Promise<TDoc> {
    return this.model.findOneAndUpdate(filter, dto, { new: true, ...options });
  }

  async findByIdAndUpdate(id: string, dto: UpdateQuery<TDoc>, options?: QueryOptions): Promise<TDoc> {
    return this.model.findByIdAndUpdate(id, dto, { new: true, ...options });
  }

  protected async preUpdateBy(filter: FilterQuery<Partial<TDoc>>, dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    return dto;
  }

  protected async postUpdateBy(updateResult: UpdateResult, dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    return updateResult;
  }

  async updateBy(filter: FilterQuery<Partial<TDoc>>, dto: Partial<TDoc>, extraOptions?: IExtraOptions) {
    const { user } = extraOptions ?? {};
    user && Object.assign(dto, { updatedById: user.viewer.id });
    const doc = await this.preUpdateBy(filter, dto, extraOptions);
    const updateResult = await this.model.updateMany(filter, doc);
    return this.postUpdateBy(updateResult, dto, extraOptions);
  }
}
