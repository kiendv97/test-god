/* eslint-disable @typescript-eslint/typedef */
import path from 'path';

import * as customEnv from 'custom-env';
import * as ip from 'ip';
import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// eslint-disable-next-line import/no-extraneous-dependencies
import  ms from 'ms';
import { KafkaConfig } from 'kafkajs';

import { generateKafkaConfig, generateMongoURI, generateRedisURI } from '@config/config.helper';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'dev';
const customEnvName = process.env.DOT_ENV_SUFFIX ?? process.env.NODE_ENV;

console.log('Using NODE_ENV: ' + process.env.NODE_ENV);
console.log('Using customEnvName: ' + customEnvName);
customEnv.env(customEnvName);

const env = Object.assign({}, process.env);
process.env = {
  DEBUG: env.DEBUG,
  NODE_ENV: env.NODE_ENV,
};

@Injectable()
export class ConfigService {
  // COMMON
  DEV = 'dev';
  TEST = 'test';
  PROD = 'prod';
  DEBUG = (env.DEBUG ?? 'false').toLowerCase() !== 'false';
  isDev = () => this.NODE_ENV === this.DEV;
  isTest = () => this.NODE_ENV === this.TEST;
  isProd = () => this.NODE_ENV === this.PROD;

  NODE_ENV = env.NODE_ENV;
  PAGINATION_PAGE_SIZE = parseInt(env.PAGINATION ?? '100', 10);
  UPLOAD_LIMIT = parseInt(env.UPLOAD_LIMIT, 10) || 250 * 1024; // 250M Byte

  MODULE_ALIAS = env.MODULE_ALIAS;

  // SPECIAL
  SR = {
    PRODUCT_NAME: env.MODULE_ALIAS,
    VERSION: 'v1.0',
    SIGNATURE: 'Tinasoft Develop Team',
    SUPPORT: {
      URL: 'https://tinasoft.vn/lien-he/',
      EMAIL: 'contact@tinasoft.vn',
    },
  };

  // DIR
  ROOT_PATH = path.resolve('.');
  STATIC_PATH = 'static';

  // NETWORK
  LOCAL_IP: string = ip.address();
  PUBLIC_IP: string = env.PUBLIC_IP ?? this.LOCAL_IP;
  PORT: number = +env.PORT;
  HOST = `http://${this.PUBLIC_IP}:${this.PORT}`;
  TCP_PORT = parseInt(env.TCP_PORT ?? '5001', 10);

  // LOGSTASH
  LOGSTASH_ENABLE = (env.LOGSTASH_ENABLE ?? 'false').toLowerCase() === 'true';
  LOGSTASH_HOST = env.LOGSTASH_HOST ?? 'localhost';
  LOGSTASH_PORT = parseInt(env.LOGSTASH_PORT ?? '50000', 10);

  // MIDDLEWARE
  RATE_LIMIT = {
    windowMs: 60 * 1000,
    max: parseInt(env.RATE_LIMIT_MIN, 10) || 120,
  };

  ENABLE_CACHE_API = false;

  CORS: CorsOptions = {
    origin: '*',
    credentials: true,
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: 'content-type, authorization, accept-encoding, user-agent, accept, cache-control, connection, cookie, ref-token',
    exposedHeaders: 'X-RateLimit-Reset, set-cookie, Content-Disposition, X-File-Name',
  };

  // DB
  MONGO_HOST = env.MONGO_HOST ?? '127.0.0.1';
  MONGO_PORT = parseInt(env.MONGO_PORT ?? '27017', 10);
  MONGO_USERNAME = env.MONGO_USERNAME;
  MONGO_PASSWORD = env.MONGO_PASSWORD;
  MONGO_DATABASE = env.MONGO_DATABASE;
  MONGO_URI = env.MONGO_URI ?? generateMongoURI(this);

  REDIS_HOST = env.REDIS_HOST ?? '127.0.0.1';
  REDIS_PORT = parseInt(env.REDIS_PORT ?? '6379', 10);
  REDIS_PASSWORD = env.REDIS_PASSWORD;
  REDIS_URI = env.REDIS_URI ?? generateRedisURI(this);
  REDIS_KEY_PREFIX = [(env.REDIS_KEY_PREFIX ?? 'DEFAULT'), this.MODULE_ALIAS, ''].join('_');
  REDIS_STORAGE = {
    // 0 ~ 15
    COMMON: 0,
    DB: 1,
    SETTING: 2,
    API: 3,
    AUTH: 5,
    QUEUE: 6,
  };

  CACHE_SHORT_TIMEOUT = ms('1m');
  CACHE_TIMEOUT = ms('1d');
  CACHE_LONG_TIMEOUT = ms('30d');

  KAFKA_BROKER_HOST = env.KAFKA_BROKER_HOST ?? 'localhost';
  KAFKA_BROKER_PORT = parseInt(env.KAFKA_BROKER_PORT ?? '9092', 10);
  KAFKA_BROKER = env.KAFKA_BROKER ?? [this.KAFKA_BROKER_HOST, this.KAFKA_BROKER_PORT].join(':');
  KAFKA_USERNAME = env.KAFKA_USERNAME;
  KAFKA_PASSWORD = env.KAFKA_PASSWORD;
  KAFKA_CLIENTID = env.KAFKA_CLIENTID;
  KAFKA_GROUPID = env.KAFKA_GROUPID ?? this.MODULE_ALIAS;
  KAFKA_SERVER_CONFIG: KafkaConfig = generateKafkaConfig(this);
  KAFKA_CLIENT_CONFIG: KafkaConfig = {
    ... this.KAFKA_SERVER_CONFIG,
    clientId: this.KAFKA_CLIENTID,
  };

  // BACKDOOR
  BACKDOOR_HOST = env.BACKDOOR_HOST;
  BACKDOOR_TOKEN = env.BACKDOOR_TOKEN;
  BACKDOOR_APPS = {
    ACCOUNT: {
      namespace: 'account',
    },
    BACKDOOR: {
      namespace: 'backdoors',
    },
    CUSTOMER: {
      namespace: 'customers',
    },
    AUTOMATION: {
      namespace: 'automation',
    },
    INTEGRATION: {
      namespace: 'integrations',
    },
    BIZ: {
      namespace: 'bizs',
    },
    SALE_CENTER: {
      namespace: 'sale-center',
    },
    PRODUCT: {
      namespace: 'products',
    },
    COUPON: {
      namespace: 'coupons',
    },
  };

  BACKDOOR_HTTP_CONFIG = {
    baseURL: this.BACKDOOR_HOST + '/api/',
    headers: {
      Authorization: 'Bearer ' + this.BACKDOOR_TOKEN,
    },
    timeout: 7000,
    maxRedirects: 5,
  };

  // PLATFORM
  HTTP_CONFIG = {
    timeout: 7000,
    maxRedirects: 5,
  };
}

export const config = new ConfigService();
