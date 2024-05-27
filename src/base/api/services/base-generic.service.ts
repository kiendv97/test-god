/* eslint-disable @typescript-eslint/no-unused-vars */
import { Model, Document, FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
import { snakeCase } from 'lodash';
import { Logger as NestLogger } from '@nestjs/common';

import { Logger, LoggingService } from '@base/logging';
import { NotFound } from '@base/api/exception';
import { Payload } from '@base/api/api.schemas';
import { BaseCacheService } from '@base/api/services/base-cache.service';

import { IServiceOptions, IExtraOptions } from './base.interface';

export class BaseGenericService<TDoc extends Document> extends BaseCacheService {
  private readonly nestLogger: NestLogger = new NestLogger(BaseGenericService.name);
  protected readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDoc>,
    protected readonly loggingService: LoggingService,
    protected readonly alias: string,
    protected readonly options?: IServiceOptions,
  ) {
    super(options);
    const aliasUp = snakeCase(alias.replace('Service', '')).toUpperCase();

    this.options = Object.assign({}, options, { alias, aliasUp });
    this.logger = this.loggingService.getLogger(alias);

    this.nestLogger.verbose(`Initialized ${alias} service`);
  }

  /* Model */
  recordOrNotFound<TData>(record: TData, payload?: Payload<any>, extraOptions?: IExtraOptions): TData {
    if (!record && !extraOptions?.skipThrow)
      throw new NotFound({
        subStatus: this.options.aliasUp + '.NOT_FOUND',
        ...payload,
      });

    return record;
  }

  /* Get One */
  private async findOne(
    filter: FilterQuery<TDoc>,
    projection?: ProjectionType<TDoc>,
    options?: QueryOptions<TDoc>,
  ): Promise<TDoc> {
    if (filter.id) {
      filter._id = filter.id;
      delete filter.id;
    }

    return this.model.findOne(filter, projection, options);
  }

  async findOneBy(filter: FilterQuery<Partial<TDoc>>, extraOptions?: IExtraOptions): Promise<TDoc> {
    return this.findOne(filter);
  }

  async getById(_id: string, extraOptions?: IExtraOptions): Promise<TDoc> {
    return this.getOneBy({ _id }, extraOptions);
  }

  async getOneBy(filter: FilterQuery<Partial<TDoc>>, extraOptions?: IExtraOptions): Promise<TDoc> {
    const record = await this.findOne(filter);
    return this.recordOrNotFound(record, null, extraOptions);
  }

  // should relation in this method
  async getOne(
    filter: FilterQuery<TDoc>,
    projection?: ProjectionType<TDoc>,
    options?: QueryOptions<TDoc>,
    extraOptions?: IExtraOptions): Promise<TDoc> {
    const record = await this.findOne(filter, projection, options);
    return this.recordOrNotFound(record, null, extraOptions);
  }
}
