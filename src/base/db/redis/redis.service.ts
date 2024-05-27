import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { RedisClientOptions } from '@redis/client/dist/lib/client';
import _, { assign, isObject } from 'lodash';
import Debug from 'debug';
import { isNumber, isString } from '@nestjs/common/utils/shared.utils';

import { Logger, LoggingService } from '@base/logging';
import { reconnectStrategy } from '@base/db/redis/redis.helper';

import { config } from '@config';

const debug = Debug('backend:redis_cache');
const { REDIS_STORAGE } = config;

class RedisClientExtend {
  public readonly store: RedisClientType & RedisClientExtend;

  constructor(
    protected readonly logger: Logger,
    protected readonly options?: RedisClientOptions,
  ) {
    this.store = createClient({
      url: config.REDIS_URI,
      database: 0,
      socket: { reconnectStrategy },
      ...options,
    }) as any;

    this.store.on('error', (error) => this.logger.error('Redis error: ', error?.message));

    void this.store.connect();
    assign(
      this.store,
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        .map(prop => ({ [prop]: this[prop].bind(this) })),
    );
  }

  /**
   * @param key
   * @param value
   * @param mexp {millisecs} time storage cache value
   */
  async setParse(key: string, value: any, mexp: number = -1) {
    debug('setCache', mexp, key);
    const setValue = isObject(value) ? Object.assign(value, { _cache: true }) : value;
    const opt = mexp > 0 ? { PX: mexp } : {};
    return this.store.set(key, JSON.stringify(setValue), opt);
  }

  async getParse<T = string>(key: string): Promise<T> {
    debug('getCache', key);
    const value = await this.store.get(key);
    return JSON.parse(value);
  }

  async hSetParse(key: string, value: Record<string, any>, mexp: number = -1) {
    debug('hSetCache', mexp, key);
    const setValue: Record<string, any> = _.mapValues(value, o => (isNumber(o) || isString(o)) ? o : JSON.stringify(o));
    setValue._cache = 'true';
    await this.store.hSet(key, setValue);
    mexp > 0 && await this.store.expire(key, mexp / 1000);
  }

  async hGetParse(key: string): Promise<Record<string, any>> {
    debug('hGetCache', key);
    const value = await this.store.hGetAll(key);
    return _.mapValues(value, o => {
      try {
        return JSON.parse(o);
      } catch (e) {
        return o;
      }
    });
  }

  async delByPattern(pattern: string): Promise<any> {
    const keys = await this.store.keys(pattern);
    await Promise.allSettled(
      keys.map(async key => this.store.del(key)),
    );
  }
}

export type RedisClient = RedisClientType & RedisClientExtend;

@Injectable()
export class RedisService {
  public common: RedisClient;
  public auth: RedisClient;
  public setting: RedisClient;
  public api: RedisClient;
  public db: RedisClient;
  public queue: RedisClient;

  constructor(
    protected readonly loggingService: LoggingService,
  ) {
    [
      this.common,
      this.auth,
      this.setting,
      this.api,
      this.db,
      this.queue,
    ] = [
      { alias: 'common-redis', database: REDIS_STORAGE.COMMON },
      { alias: 'auth-redis', database: REDIS_STORAGE.AUTH },
      { alias: 'setting-redis', database: REDIS_STORAGE.SETTING },
      { alias: 'api-redis', database: REDIS_STORAGE.API },
      { alias: 'db-redis', database: REDIS_STORAGE.DB },
      { alias: 'queue-redis', database: REDIS_STORAGE.QUEUE },
    ].map(
      ({ alias, database }) => new RedisClientExtend(
        this.loggingService.getLogger(alias),
        { database },
      )
        .store,
    );
  }
}
