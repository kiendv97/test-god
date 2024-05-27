import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import * as express from 'express';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
// import { KafkaOptions, TcpOptions, Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import compression from '@fastify/compress';

import { inspectMessageMongoDb, LoggingService } from '@base/logging';
import { initSwagger } from '@base/swagger';
import {
  HttpExceptionFilter,
  UnknownExceptionsFilter,
  ResponseTransformInterceptor,
  useMorgan,
  MongoExceptionFilter, FASTIFY_MORGAN_LOGGER,
} from '@base/middleware';
import { exceptionFactory, CustomValidationPipe } from '@base/middleware/custom-validation.pipe';

import { AppModule } from '@app.module';
import { config } from '@config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(FASTIFY_MORGAN_LOGGER),
    );
  const loggingService = app.get(LoggingService);
  const logger = loggingService.getLogger();

  app.enableCors(config.CORS);
  app.setGlobalPrefix('api');
  app.use(useMorgan(loggingService.logger.access));
  app.use('/favicon.ico', express.static(config.STATIC_PATH + '/favicon.ico'));

  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new MongoExceptionFilter(loggingService));
  app.useGlobalFilters(new UnknownExceptionsFilter(loggingService));
  app.useGlobalFilters(new HttpExceptionFilter(loggingService));
  app.useGlobalPipes(
    new CustomValidationPipe({
      exceptionFactory,
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  initSwagger(app);
  inspectMessageMongoDb(loggingService.getLogger('mongoDB'));

  await app.register(rateLimit, config.RATE_LIMIT);
  await app.register(compression, { encodings: ['gzip', 'deflate'] });
  config.NODE_ENV === config.PROD && await app.register(helmet);

  // app.connectMicroservice(
  //   {
  //     transport: Transport.TCP,
  //     options: {
  //       host: '0.0.0.0',
  //       port: config.TCP_PORT,
  //     },
  //   } as TcpOptions,
  //   { inheritAppConfig: true },
  // );
  // app.connectMicroservice(
  //   {
  //     transport: Transport.KAFKA,
  //     options: {
  //       client: config.KAFKA_CLIENT_CONFIG,
  //       consumer: {
  //         groupId: config.KAFKA_GROUPID,
  //         retry: {
  //           initialRetryTime: 100_000,
  //         },
  //       },
  //     },
  //   } as KafkaOptions,
  //   { inheritAppConfig: true },
  // );

  void app.startAllMicroservices();
  await app.listen(config.PORT, '0.0.0.0');
  const hostname = config.HOST;
  logger.info('Server time: ' + new Date().toString());
  logger.info(`Local - public: ${config.LOCAL_IP} - ${config.PUBLIC_IP}`);
  logger.info(`HTTP, TCP port: ${config.PORT} - ${config.TCP_PORT}`);
  logger.info(`Running app on: ${hostname}`);
  logger.info(`Api DocumentV1: ${hostname}/apidoc`);
  logger.info(`Api gateway v1: ${hostname}/api`);
}

void bootstrap();
