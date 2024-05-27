import { OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { RedisClient, RedisService } from '@base/db/redis';
import { Logger, LoggingService } from '@base/logging';

export class SchedulerService implements OnModuleInit {
  protected readonly logger: Logger;
  protected readonly cache: RedisClient = this.redisService.queue;

  constructor(
    protected readonly loggingService: LoggingService,
    protected readonly alias: string,
    protected readonly redisService: RedisService,
    protected readonly cacheKey: string,
  ) {
    this.logger = this.loggingService.getLogger(alias);
  }

  onModuleInit() {
    void this.handleDeleteAtomic(this.cacheKey);
    void this.handleCreateSchedule(this.cacheKey);
  }

  @Cron('0 10,50 */1 * * *')
  async handleDeleteAtomic(cacheKey: string) {
    await this.cache.del(cacheKey);
    this.logger.debug('DELETE CACHE_KEY', cacheKey);
  }

  async handleCreateSchedule(cacheKey: string) {
    this.logger.debug('START HANDLE_CREATE_SCHEDULE', cacheKey);
    const now = Date.now();

    const hadSet = await this.cache.setNX(cacheKey, now.toString());
    if (!hadSet) {
      this.logger.debug('SKIP HANDLE_CREATE_SCHEDULE', cacheKey);
      return;
    }

    await this.createSchedule(now, cacheKey);

    this.logger.debug('FINISH HANDLE_CREATE_SCHEDULE', cacheKey);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createSchedule(now: number, cacheKey?: string) { /**/ }
}
