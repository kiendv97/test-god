import { Catch, ArgumentsHost } from '@nestjs/common';
import { Logger } from 'log4js';
import { throwError } from 'rxjs';
import { FastifyReply } from 'fastify';

import { BaseRpcException, BusinessException, SYSTEM_ERROR } from '@base/api/exception';
import { HttpExceptionFilter } from '@base/middleware/http-exception.filter';
import * as exc from '@base/api/exception';

import { MONGOOSE_ERROR_CODES } from '@shared';

@Catch()
export class UnknownExceptionsFilter extends HttpExceptionFilter {
  private loggerMongo: Logger = this.loggingService.getLogger('mongoose-exceptions');
  private loggerUnknown: Logger = this.loggingService.getLogger('unknown-exceptions');

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const mongosubStatus: string = exception.name;

    if (MONGOOSE_ERROR_CODES.includes(mongosubStatus)) {
      this.loggerMongo.debug(exception);
      const queryDbError = new exc.QueryDbError({
        subStatus: mongosubStatus,
        data: exception.message,
      });
      return super.catch(queryDbError, host) as any;
    }

    this.loggerUnknown.error(exception);

    const e = new BusinessException({
      subStatus: SYSTEM_ERROR,
    });

    if (host.getType() === 'rpc') {
      const context = host.switchToRpc().getContext();
      this.loggerUnknown.debug(context?.args?.pop());
      return throwError(() => new BaseRpcException(e.getResponse()));
    }

    void response.status(500).send(e.getResponse());
  }
}
