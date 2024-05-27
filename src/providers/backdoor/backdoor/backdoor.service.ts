import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { decode } from 'jsonwebtoken';

import { LoggingService } from '@base/logging';
import * as exc from '@base/api/exception';
import { getKey, RedisClient, RedisService } from '@base/db/redis';

import { FetchService } from '@providers/backdoor/base/services/fetch.service';
import {
  IAppAuth,
  IVerifyBackdoor,
  IVerifyPublicBiz,
} from '@providers/backdoor/backdoor/backdoor.interface';
import { IJwt } from '@providers/backdoor/account/account.interface';

import { config } from '@config';

const { namespace } = config.BACKDOOR_APPS.BACKDOOR;

@Injectable()
export class BackdoorService extends FetchService<IVerifyBackdoor> {
  private cache: RedisClient = this.redisService.auth;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly loggingService: LoggingService,
    private redisService: RedisService,
  ) {
    super(httpService, loggingService, BackdoorService.name);
  }

  async verifyToken(backdoorToken: string): Promise<IAppAuth> {
    const jwtPayload: IJwt = decode(backdoorToken, { json: true });
    const cacheKey = getKey({
      model: 'backdoor',
      userId: jwtPayload.id,
    });

    const cached = await this.cache.getParse<IAppAuth>(cacheKey);
    if (cached) return cached;


    const response = await this.httpService.axiosRef.get<IVerifyBackdoor>(
      `${namespace}/verify`, {
        headers: { Authorization: `Bearer ${backdoorToken}` },
      },
    ).catch(e => this.throwApiError(e)) as AxiosResponse<IVerifyBackdoor>;

    const data = response.data;
    if (data?.status !== 200 || !data.data?.scopes || !Array.isArray(data.data.scopes))
      throw new exc.Unauthorized({
        subStatus: 'BACKDOORSERVICE.UNAUTHORIZED',
      });

    if (!data.data.scopes?.includes(config.MODULE_ALIAS))
      throw new exc.Forbidden({
        subStatus: 'BACKDOORSERVICE.FORBIDDEN',
      });

    void this.cache.setParse(cacheKey, data.data, config.CACHE_SHORT_TIMEOUT);

    return data.data;
  }

  async verifyPublicBizToken(bizToken: string): Promise<IVerifyPublicBiz> {
    const jwtPayload: IJwt & { alias?: string } = decode(bizToken, { json: true });
    const cacheKey = getKey({
      model: 'public_biz_auth',
      alias: jwtPayload.alias,
      userId: jwtPayload.id,
    });

    const cached = await this.cache.getParse<IVerifyPublicBiz>(cacheKey);
    if (cached) return cached;

    const response = await this.httpService.axiosRef.get<IVerifyPublicBiz>(
      `public/bizs/${jwtPayload.alias}`, {
        headers: { Authorization: `Bearer ${bizToken}` },
      },
    ).catch(e => this.throwApiError(e)) as AxiosResponse<IVerifyPublicBiz>;

    const data = response.data;
    if (data?.status !== 200 || (data.data?.id !== jwtPayload.id))
      throw new exc.Unauthorized({
        subStatus: 'PUBLIC_BIZ_SERVICE.UNAUTHORIZED',
      });

    void this.cache.setParse(cacheKey, data, config.CACHE_LONG_TIMEOUT);

    return data;
  }
}
