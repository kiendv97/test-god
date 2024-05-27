import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { decode } from 'jsonwebtoken';

import { LoggingService, Logger } from '@base/logging';
import { Forbidden, Unauthorized } from '@base/api/exception';
import { getKey, RedisClient, RedisService } from '@base/db/redis';

import { IAccountAuth, IAdminAuth, IGetMe, IJwt } from '@providers/backdoor/account/account.interface';

import { config } from '@config';

@Injectable()
export class AccountService {
  private logger: Logger = this.loggingService.getLogger(AccountService.name);
  private cache: RedisClient = this.redisService.auth;

  constructor(
    protected readonly httpService: HttpService,
    private loggingService: LoggingService,
    private redisService: RedisService,
  ) {}

  async checkUserPermission(bizAlias: string, userToken: string, refToken?: string): Promise<IAccountAuth> {
    const jwtPayload: null | IJwt = decode(userToken, { json: true });
    const cacheKey = getKey({
      model: bizAlias,
      userId: jwtPayload?.id,
    });

    const cached = await this.cache.getParse<IAccountAuth>(cacheKey);
    if (cached) return cached;

    const headers = { Authorization: `Bearer ${userToken}` };
    if (refToken) headers['ref-token'] = refToken;

    const response = await this.httpService.axiosRef.get(
      `bizs/${bizAlias}/modules/${config.MODULE_ALIAS}`, {
        headers,
      },
    ).catch(e => {
      this.logger.warnError(e);
      throw new Unauthorized({
        subStatus: 'ACCOUNT.AUTH_ERROR',
      });
    });

    const data = response.data;
    if (!data)
      throw new Forbidden({
        subStatus: 'ACCOUNT.FORBIDDEN',
      });

    if (data.status !== 200)
      throw new Unauthorized({
        subStatus: 'ACCOUNT.UNAUTHORIZED',
      });

    void this.cache.setParse(cacheKey, data, config.CACHE_SHORT_TIMEOUT);

    return data;
  }

  async me(userToken: string): Promise<IAdminAuth> {
    const jwtPayload: null | IJwt = decode(userToken, { json: true });
    const cacheKey = getKey({
      model: 'user',
      alias: 'me',
      userId: jwtPayload?.id,
    });

    const cached = await this.cache.getParse<IAdminAuth>(cacheKey);
    if (cached) return cached;

    const headers = { Authorization: `Bearer ${userToken}` };

    const response = await this.httpService.axiosRef.get<IGetMe>(
      'users/me', {
        headers,
      },
    ).catch(e => {
      this.logger.warnError(e);
      throw new Unauthorized({
        subStatus: 'ACCOUNT.GET_ME_ERROR',
      });
    });

    const data = response.data as IAdminAuth;
    if (data?.status !== 200)
      throw new Unauthorized({
        subStatus: 'ACCOUNT.UNAUTHORIZED',
      });

    data.viewer = data.data;
    delete data.data;

    void this.cache.setParse(cacheKey, data, config.CACHE_SHORT_TIMEOUT);

    return data;
  }
}
