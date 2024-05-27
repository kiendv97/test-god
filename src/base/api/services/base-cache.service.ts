import { IServiceOptions } from '@base/api';
import { getKey } from '@base/db/redis';

export class BaseCacheService {
  constructor(
    protected readonly options?: IServiceOptions,
  ) {}

  /* Cache DB */
  getKeyCacheList(uniqueId: string, filter?: Record<any, any>) {
    return (!uniqueId || !this.options?.redisService)
      ? undefined
      : getKey({
        model: this.options.alias,
        alias: 'getList:',
        userId: uniqueId.toString(),
        queryParams: filter ?? {},
      });
  }

  delCacheList(uniqueId: string) {
    const key = this.getKeyCacheList(uniqueId);
    if (!key)
      return;

    void this.options.redisService.db.delByPattern(key + '*');
  }

  getKeyCacheOne(uniqueId: string, filter?: Record<any, any>) {
    return (!uniqueId || !this.options?.redisService)
      ? undefined
      : getKey({
        model: this.options.alias,
        alias: 'getOne:',
        userId: uniqueId.toString(),
        queryParams: filter ?? {},
      });
  }

  delCacheOne(uniqueId: string, filter?: any) {
    const key = this.getKeyCacheOne(uniqueId);
    if (!key)
      return;

    void (!filter
      ? this.options.redisService.db.del(key)
      : this.options.redisService.db.delByPattern(key + '*'));
  }
}
