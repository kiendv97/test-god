import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory, Transport,
} from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { isInstance } from 'class-validator';
import * as _ from 'lodash';

import { Logger, LoggingService } from '@base/logging';
import { Payload } from '@base/api';
import * as exc from '@base/api/exception';

import { config } from '@config';

@Injectable()
export class BackdoorProxy {
  protected readonly clientProxy: ClientProxy;
  private logger: Logger = this.loggingService.getLogger(BackdoorProxy.name);

  constructor(
    private loggingService: LoggingService,
  ) {
    this.clientProxy = ClientProxyFactory.create({
      options: {
        port: config.TCP_PORT,
        host: '127.0.0.1',
      },
      transport: Transport.TCP,
    });
  }

  async send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput,
  ): Promise<Payload<TResult>> {
    this.logger.debug(`[PROXY SENDING][${pattern}]:` + JSON.stringify(data));
    try {
      const res = await firstValueFrom(
        this.clientProxy.send<Payload<TResult>, TInput>(pattern, data).pipe(timeout(7000)),
      );

      if (!res.success) {
        this.logger.warn(`[PROXY ERROR][${pattern}]:` + JSON.stringify(res));
      }

      return res;

    } catch (error) {
      this.logger.warnError(error);

      const excResponse = error.error;
      if (typeof excResponse === 'object' && Object.getOwnPropertyDescriptor(excResponse, 'success'))
        return excResponse;

      if (isInstance(error, TimeoutError))
        return new exc.RequestTimeout({
          subStatus: 'BACKDOOR_PROXY.REQUEST_TIMEOUT',
          subStatusText: _.get(error, 'message'),
        }).getResponse() as Payload<TResult>;

      return new exc.BadRequest({
        subStatus: 'BACKDOOR_PROXY.CALL_OUT_ERROR',
        subStatusText: _.get(error, 'message'),
      }).getResponse() as Payload<TResult>;
    }
  }
}
