/* eslint-disable @typescript-eslint/typedef */
import util from 'util';

import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  configure,
  getLogger,
  Appender,
  Layout,
  LoggingEvent,
  Logger as Logger4js,
} from 'log4js';

import { config } from '@config';

// eslint-disable-next-line no-control-regex
const COLOR_REGEX = new RegExp('[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]', 'g');

export interface Logger extends Logger4js {
  warnError: (error: any) => void;
}

function inspectMessage(logEvent: LoggingEvent, joinAs: string = ' ', color: boolean = true) {
  const msg = logEvent.data
    .map(message => typeof message === 'string'
      ? message
      : util.inspect(message, false, null, color),
    )
    .join(joinAs);
  return color ? msg : msg.replace(COLOR_REGEX, '').replace(/(\r|\n)*/giu, '');
}

const inspectMessageFile = (logEvent: LoggingEvent, joinAs: string = ' ') => inspectMessage(logEvent, joinAs, false);

export function inspectMessageMongoDb(loggerDB: Logger) {
  mongoose.set('debug', (collectionName: string, methodName: string, ...methodArgs: any[]) => {
    const logEvent = { data: methodArgs } as LoggingEvent;
    const message = `${collectionName}.${methodName}(${inspectMessage(logEvent, '')})`;
    loggerDB.debug(message);
  });
  // mongoose.set('debug', true);
}

const layouts: Record<string, Layout> = {
  console: {
    type: 'pattern',
    pattern: '%[%-6p %d %20.20f{2}:%-4.-4l| %.6000x{message} (%c)%]',
    tokens: {
      message: inspectMessage,
    },
  },
  dateFile: {
    type: 'pattern',
    pattern: '%-6p %d %20.20f{2}:%-4.-4l| %x{message} (%c)',
    tokens: {
      message: inspectMessageFile,
    },
  },
  access: {
    type: 'pattern',
    pattern: 'ACCESS %d %23.23x{remoteAddr}  | %x{access} (%c)',
    tokens: {
      remoteAddr: function (logEvent: LoggingEvent) {
        let remoteAddr = logEvent.data.toString().split(' ', 1).pop();
        remoteAddr = remoteAddr.replace(/^.*:/, '');
        remoteAddr = remoteAddr === '1' ? '127.0.0.1' : remoteAddr;
        return remoteAddr;
      },
      access: function (logEvent: LoggingEvent) {
        const [, ...data] = logEvent.data.toString().split(' ');
        data.pop();
        return data.join(' ');
      },
    },
  },
};

const appenders: Record<string, Appender> = {
  console: {
    type: 'console',
    layout: layouts.console,
  },
  dateFile: {
    type: 'dateFile',
    filename: 'logs/out.log',
    pattern: 'yyyy-MM-dd',
    layout: layouts.dateFile,
    keepFileExt: true,
    numBackups: 5,
  },
  access: {
    type: 'console',
    layout: layouts.access,
  },
  network: {
    type: 'tcp',
    host: config.LOGSTASH_HOST,
    port: config.LOGSTASH_PORT,
    endMsg: '\n',
    layout: layouts.dateFile,
  },
  accessNetwork: {
    type: 'tcp',
    host: config.LOGSTASH_HOST,
    port: config.LOGSTASH_PORT,
    endMsg: '\n',
    layout: layouts.access,
  },
};

@Injectable()
export class LoggingService {
  constructor() {
    const level = config.DEBUG ? 'debug' : 'info';

    configure({
      pm2: true,
      disableClustering: true,
      appenders: appenders,
      categories: {
        default: {
          appenders: ['console', 'dateFile'].concat(config.LOGSTASH_ENABLE ? ['network'] : []),
          level: level,
          enableCallStack: true,
        },
        access: {
          appenders: ['access', 'dateFile'].concat(config.LOGSTASH_ENABLE ? ['accessNetwork'] : []),
          level: 'info',
          enableCallStack: true,
        },
      },
    });
  }

  getLogger(category?: string): Logger {
    const logger = getLogger(category);
    return Object.assign(logger, {
      warnError: (error: any) => {
        const msg = error?.response?.data?.error || error?.response?.data || error?.response || error;
        logger.warn(msg);
      },
    });
  }

  private _access = () => {
    const logger = getLogger('access');
    return {
      write: logger.info.bind(logger),
    };
  };

  logger = {
    default: getLogger('default'),
    access: this._access(),
    thirdParty: getLogger('thirdParty'),
  };

  tryErrorMsg(error: any) {
    return error?.response?.data?.error || error?.response?.data || error?.response || error;
  }
}
