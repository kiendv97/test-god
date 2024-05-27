/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, FilterQuery } from 'mongoose';
import { DeleteResult } from 'mongodb';


import { BaseCreateOrUpdateService } from '@base/api/services/base-create-or-update.service';

import { IExtraOptions } from './base.interface';


export class BaseDeleteService<TDoc extends Document> extends BaseCreateOrUpdateService<TDoc> {
  /* Delete */
  protected async preDeleteOne(filter: FilterQuery<Partial<TDoc>>, extraOptions?: IExtraOptions) { /* */ }

  protected async postDeleteOne(record: TDoc, filter: FilterQuery<Partial<TDoc>>, extraOptions?: IExtraOptions) {
    return record;
  }

  async deleteOneBy(filter: FilterQuery<Partial<TDoc>>, extraOptions: IExtraOptions = {}) {
    await this.preDeleteOne(filter, extraOptions);
    const deleted = await this.model.findOneAndRemove(filter);
    return this.postDeleteOne(deleted, filter, extraOptions);
  }

  protected async preDeleteBy(filter: FilterQuery<Partial<TDoc>>, extraOptions?: IExtraOptions) { /* */ }

  protected async postDeleteBy(deleteResult: DeleteResult, filter: FilterQuery<Partial<TDoc>>, extraOptions?: IExtraOptions) {
    return deleteResult;
  }

  async deleteBy(filter: FilterQuery<Partial<TDoc>>, extraOptions: IExtraOptions = {}) {
    await this.preDeleteBy(filter, extraOptions);
    const deleteResult = await this.model.deleteMany(filter);
    return await this.postDeleteBy(deleteResult, filter, extraOptions);
  }
}
