import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'log4js';
import { KafkaContext, TcpContext, Transport } from '@nestjs/microservices';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { FastifyReply } from 'fastify';

import { LoggingService } from '@base/logging';
import * as exc from '@base/api/exception';
import { BaseRpcException } from '@base/api/exception';
import { enumToObj } from '@base/swagger';

enum EventTransport {
  getTopic = Transport.KAFKA,
  getPattern = Transport.TCP,
}

function getRpcTransport(context: KafkaContext & TcpContext): Transport {
  for (const funcName of Object.keys(enumToObj(EventTransport))) {
    if (typeof context[funcName] === 'function')
      return EventTransport[funcName];
  }
}

function getRpcContextEventPattern(context: KafkaContext & TcpContext) {
  const transport = getRpcTransport(context);
  return !isNil(transport) && (Transport[transport] + ' ' + context[EventTransport[transport]]());
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger: Logger = this.loggingService.getLogger('http-exception');

  constructor(protected readonly loggingService: LoggingService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const hostType = host.getType();
    if (!['http', 'rpc'].includes(hostType)) return;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    let excResponse = exception.getResponse();
    const excStatus = exception.getStatus();

    if (typeof excResponse !== 'object' || !Object.getOwnPropertyDescriptor(excResponse, 'success')) {
      let newDataResponse: Record<string, any> =
        typeof excResponse === 'object' ? excResponse : { message: excResponse };
      newDataResponse = newDataResponse?.message;
      excResponse = new exc.BadRequest({
        status: excStatus,
        statusText: HttpStatus[excStatus],
        subStatus: exc.UNKNOWN,
        data: newDataResponse,
      }).getResponse();
    }

    // HTTP
    if (hostType === 'http') {
      void response.status(200).send(excResponse);
      this.logger.debug(excStatus, JSON.stringify(excResponse));
    }

    // RPC
    if (hostType === 'rpc') {
      const context = host.switchToRpc().getContext();
      const eventPattern = getRpcContextEventPattern(context);
      this.logger.debug(eventPattern, excResponse);

      const transport = getRpcTransport(context);
      switch (transport) {
        case Transport.KAFKA:
          await context.getConsumer().commitOffsets([{
            topic: context.getTopic(),
            partition: context.getPartition(),
            offset: context.getMessage().offset,
          }]).catch((err) => this.logger.error(err));
          break;
        case Transport.TCP:
          return new BaseRpcException(excResponse);
      }
    }
  }
}
