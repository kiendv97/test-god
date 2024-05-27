import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { get, snakeCase } from 'lodash';
import { Logger as NestLogger } from '@nestjs/common';

import { LoggingService, Logger } from '@base/logging';
import { FailedDependency, NotFound } from '@base/api/exception';
import { RedisService } from '@base/db/redis';
import { BaseCacheService, IExtraOptions, Payload } from '@base/api';

import { IBatchData, IBatchResponse, IResponse } from '@providers/backdoor/base/interfaces/response.interface';

interface IServiceOptions {
  alias?: string;
  aliasUp?: string;
  redisService?: RedisService;
}

export class FetchService<TData = any> extends BaseCacheService {
  private readonly nestLogger: NestLogger = new NestLogger(FetchService.name);
  protected logger: Logger;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly loggingService: LoggingService,
    protected readonly alias: string,
    protected readonly options?: IServiceOptions,
  ) {
    super(options);
    const aliasUp = snakeCase(alias.replace('Service', '')).toUpperCase();

    this.options = Object.assign({}, options, { alias, aliasUp });
    this.logger = this.loggingService.getLogger(alias);

    this.nestLogger.verbose(`Initialized ${alias} provider`);
  }

  recordOrNotFound<TData>(record: TData, payload?: Payload<any>, extraOptions?: IExtraOptions): TData {
    if (!record && !extraOptions?.skipThrow)
      throw new NotFound({
        subStatus: this.options.aliasUp + '.NOT_FOUND',
        ...payload,
      });

    return record;
  }

  throwApiError(error: any, subStatusExtend?: string) {
    this.logger.warn(error);
    throw new FailedDependency({
      subStatus: this.getSubStatus('API_ERROR', subStatusExtend),
      data: this.loggingService.tryErrorMsg(error),
    });
  }

  tryData<T = TData>(response: void | AxiosResponse<IBatchResponse<T>>, subStatusExtend?: string): IResponse<T> {
    const data = get(response, 'data.data') as IBatchData<T>[];
    if (data?.length) {
      const itemDataResponse = data[0].response;
      if (itemDataResponse?.status === 200 && itemDataResponse?.data) {
        return itemDataResponse;
      }
    }

    throw new FailedDependency({
      subStatus: this.getSubStatus('DATA_ERROR', subStatusExtend),
      data,
    });
  }

  private getSubStatus(subStatusSuffix: string, subStatusExtend: string) {
    return this.options.aliasUp + '.' + (subStatusExtend ? subStatusExtend + '_' : '') + subStatusSuffix;
  }
}
