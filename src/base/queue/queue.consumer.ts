import { Job } from 'bull';
import { OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';

import { Logger, LoggingService } from '@base/logging';

export class QueueConsumer {
  protected readonly logger: Logger;

  constructor(
    protected alias: string,
    protected loggingService: LoggingService,
  ) {
    this.logger = this.loggingService.getLogger(alias);
  }

  @OnQueueActive()
  handlerOnQueueActive(job: Job) {
    this.logger.info('handleOnQueueStart', job.name);
  }

  @OnQueueCompleted()
  handlerOnQueueCompleted(job: Job) {
    this.logger.info('handlerOnQueueCompleted', job.name);
    job.remove().catch(e => {
      this.logger.warn(e);
    });
  }

  @OnQueueFailed()
  handlerOnQueueFailed(job: Job, err: Error) {
    this.logger.warn('handlerOnQueueFailed', job.name);
    this.logger.warn(err);
    job.remove().catch(e => {
      this.logger.warn(e);
    });
  }

  protected handlerOnJobCompleted(job: Job) {
    this.logger.info('handlerOnJobCompleted', job.name);
  }
}
