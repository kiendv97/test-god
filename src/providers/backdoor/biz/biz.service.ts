import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { LoggingService, Logger } from '@base/logging';
import { PaginatedResult } from '@base/api';
import { RedisClient, RedisService } from '@base/db/redis';

import { IBizFindMany, Biz, IBizFindOne } from '@providers/backdoor/biz/biz.class';
import { ListBizQueryDto } from '@providers/backdoor/biz/biz.dto';
import { FetchService } from '@providers/backdoor/base/services/fetch.service';


import { config } from '@config';

const { namespace } = config.BACKDOOR_APPS.BIZ;

@Injectable()
export class BizService extends FetchService<Biz[]> {
  protected logger: Logger = this.loggingService.getLogger(BizService.name);
  private cache: RedisClient = this.redisService.db;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly loggingService: LoggingService,
    private redisService: RedisService,
  ) {
    super(httpService, loggingService, BizService.name, {
      redisService,
    });
  }

  async getOne(id: string): Promise<Biz> {
    return this.recordOrNotFound(await this.findOne(id));
  }

  async findOne(id: string): Promise<Biz> {
    const cacheKey = this.getKeyCacheOne(id);
    const record: any = await this.cache.getParse(cacheKey);

    if (record)
      return record;

    const response = await this.httpService.axiosRef.post<IBizFindOne>(
      namespace,
      [{ method: 'findOne', query: { id } }],
    ).catch(e => this.throwApiError(e));

    const data = this.tryData<Biz>(response);
    await this.cache.setParse(cacheKey, data.data, config.CACHE_SHORT_TIMEOUT);

    return data.data;
  }

  async findMany(query: ListBizQueryDto): Promise<PaginatedResult<Biz>> {
    const cacheKey = this.getKeyCacheList('findMany', query);
    const record: any = await this.cache.getParse(cacheKey);

    if (record)
      return record;

    const response = await this.httpService.axiosRef.post<IBizFindMany>(
      namespace,
      [{ method: 'findMany', query }],
    ).catch(e => this.throwApiError(e));

    const data = this.tryData(response);
    const ret = new PaginatedResult(data.data, query, { total: data.total });

    await this.cache.setParse(cacheKey, ret, config.CACHE_SHORT_TIMEOUT);
    return ret;
  }
}
