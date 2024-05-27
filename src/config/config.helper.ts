import { KafkaConfig, SASLOptions } from 'kafkajs';

import { ConfigService } from '@config/config.service';


export const generateMongoURI = (config: ConfigService): string => {
  const auth = (config.MONGO_USERNAME && config.MONGO_PASSWORD)
    ? `${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@`
    : '';
  const path = `${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DATABASE}`;
  return 'mongodb://' + auth + path;
};

export const generateRedisURI = (config: ConfigService): string => {
  const auth = config.REDIS_PASSWORD
    ? `:${config.REDIS_PASSWORD}@`
    : '';
  const path = `${config.REDIS_HOST}:${config.REDIS_PORT}`;
  return 'redis://' + auth + path;
};

export const generateKafkaConfig = (config: ConfigService): KafkaConfig => {
  const sasl: SASLOptions = (config.KAFKA_USERNAME && config.KAFKA_PASSWORD)
    ? {
      mechanism: 'plain',
      username: config.KAFKA_USERNAME,
      password: config.KAFKA_PASSWORD,
    }
    : undefined;
  return sasl
    ? {
      brokers: [config.KAFKA_BROKER],
      sasl,
    }
    : {
      brokers: [config.KAFKA_BROKER],
    };
};
