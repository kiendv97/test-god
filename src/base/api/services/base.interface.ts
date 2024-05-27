import { RedisService } from '@base/db/redis';

import { IAccountAuth } from '@providers/backdoor/account/account.interface';

export interface ICacheApi {
  urlSuffix: string;
}

export interface IServiceOptions {
  alias?: string;
  aliasUp?: string;
  cacheApi?: ICacheApi;
  redisService?: RedisService;
}

export interface IExtraOptions {
  skipThrow?: boolean;
  extraData?: Record<string, any>;
  user?: IAccountAuth;
  skipCache?: boolean;
  updateOne?: {
    includeOldRecord: true;
  };
}
