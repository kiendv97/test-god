import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { FastifyReply } from 'fastify';
import { Logger } from 'log4js';

import { LoggingService } from '@base/logging';
import * as exc from '@base/api/exception';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}
  private logger: Logger = this.loggingService.getLogger('mongodb-exception');

  catch(exception: MongoError, host: ArgumentsHost) {
    this.logger.warn({ mongoExcHostType: host.getType() });

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let error: HttpException;
    switch (exception.code) {
      case 11000: {
        const regexTest = /test.[a-zA-Z]* index/.exec(exception.message);
        const schemaName = regexTest ? regexTest[0].substring(5, regexTest[0].length - 6).toUpperCase() : '';
        // const keyPattern =  Object.keys(exception.keyPattern as Record<string, string>)[0].toUpperCase();
        const subStatus = schemaName + '.' + exc.DUPLICATE;
        error = new exc.BadRequest({
          subStatus,
        });
        break;
      }

      default:
        error = new exc.BadRequest({
          subStatus: exception.name,
        });
    }
    void response.status(200).send(error.getResponse());
    this.logger.debug(exception, error.getResponse());
  }
}
