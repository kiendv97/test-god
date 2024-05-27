import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { LoggingService } from '@base/logging';
import { getKey, RedisClient, RedisService } from '@base/db/redis';
import { FailedDependency } from '@base/api/exception';

import { IIntegration, IIntegrationFindOne } from '@providers/backdoor/integration/integration.interface';
import { FetchService } from '@providers/backdoor/base';

import { config } from '@config';

const { namespace } = config.BACKDOOR_APPS.INTEGRATION;

@Injectable()
export class IntegrationService extends FetchService {
  private cache: RedisClient = this.redisService.db;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly loggingService: LoggingService,
    private redisService: RedisService,
  ) {
    super(httpService, loggingService, IntegrationService.name);
  }

  async findOne(query: { id: string; bizId: string }): Promise<IIntegration> {
    const cacheKey = getKey({
      model: 'integrations',
      queryParams: query,
    });
    const cached = await this.cache.getParse<IIntegration>(cacheKey);

    let data: IIntegration;
    let willSetCache = false;
    if (!cached?.zalo_oa?.expiredTokenTime) {
      data = await this._findOne(query);
      willSetCache = true;
    } else
      data = cached;

    const expiredTokenTime = new Date(data.zalo_oa.expiredTokenTime).getTime();
    const now = new Date().getTime();
    const expire = expiredTokenTime - 25_200_000 - now - 100_000; // 25_200_000 = 7h GMT, 100_000 = 1p

    if (expire < 0) {
      data = await this._refreshZaloToken(query);
      willSetCache = true;
    }

    willSetCache && await this.cache.setParse(cacheKey, data, expire);

    return data;
  }

  private async _findOne(query: { id: string; bizId: string }): Promise<IIntegration> {
    const response = await this.httpService.axiosRef.post(
      namespace,
      [{ method: 'findOne', query }],
    ).catch(e => this.throwApiError(e)) as AxiosResponse<IIntegrationFindOne>;

    const data = this.tryData(response);
    if (!data?.data?.zalo_oa?.accessToken)
      throw new FailedDependency({
        subStatus: 'INTEGRATION.ACCESS_TOKEN_FAIL',
        data: data,
      });

    return data.data;
  }

  private async _refreshZaloToken(query: { id: string; bizId: string }): Promise<IIntegration> {
    const response = await this.httpService.axiosRef.post(
      namespace,
      [{ method: 'refreshToken', query }],
    ).catch(e => this.throwApiError(e)) as AxiosResponse<IIntegrationFindOne>;

    const data = this.tryData(response);

    return data.data;
  }
}
