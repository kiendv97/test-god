import _ from 'lodash';

import { ICacheKeys } from '@base/db/redis/cache.interface';

import { config } from '@config';

export const reconnectStrategy = (retries: number) => {
  if (retries > 50) {
    throw new Error('Redis limit retry connection');
  } else if (retries > 25) {
    return 30_000;
  }
  if (retries > 10) {
    return 15_000;
  }
  return 5_000;
};

export function getKey({ model = '', alias = '', userId = '', queryParams = {} }: ICacheKeys): string {
  const stringQueryParams = _.sortBy(Object.entries(queryParams))
    .map(([key, value]) =>
      [key, JSON.stringify(value)]
        .join('-')
        .replace(/:/g, ''))
    .join(':');
  return [config.REDIS_KEY_PREFIX, model, alias + String(userId), stringQueryParams]
    .filter(o => o !== '')
    .join(':');
}

export function getKeySimple(
  model: string | number = '',
  alias: string | number = '',
  userId: string | number = '',
  queryParams: Record<any, any> = {},
): string {
  return getKey({ model, alias, userId, queryParams });
}
