import { HttpException, HttpStatus, ValidationError as NestValidationError } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { Payload, defaultPayload } from '@base/api/api.schemas';

import { ERROR_MESSAGES } from '@shared';

export const SUCCESS = '000000';
export const UNKNOWN = '999999';
export const SYSTEM_ERROR = '990001';
export const VALIDATION = 'VALIDATION_ERROR';
export const NOT_FOUND = 'NOT_FOUND';
export const DUPLICATE = 'DUPLICATE';

export const ALL_MESSAGES: Record<string, string> = {
  ...ERROR_MESSAGES,
  [SUCCESS]: 'Success',
  [UNKNOWN]: 'Unknown error',
  [SYSTEM_ERROR]: 'Uh oh! Something went wrong. Please report to develop team.',
  [VALIDATION]: 'Invalid input data.',
  [NOT_FOUND]: 'Not found',
  [DUPLICATE]: 'Duplicate information',

};
const ALL_ERROR_CODES = Object.keys(ALL_MESSAGES);

export abstract class BaseException<TData> extends HttpException {
  protected constructor(partial: Payload<TData>, statusCode: number, defaultMessage: string = '') {
    const payload = {
      ...defaultPayload,
      status: statusCode,
      statusText: HttpStatus[statusCode],
      ...partial,
    };
    payload.success = payload.subStatus === SUCCESS && payload.message === '';
    payload.message = payload.message || ALL_MESSAGES[payload.subStatus] || defaultMessage;
    super(payload, statusCode);
  }
}

export class BusinessException<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(payload, statusCode);
  }
}

export class BadRequest<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.BAD_REQUEST);
  }
}

export class Unauthorized<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.UNAUTHORIZED);
  }
}

export class Forbidden<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.FORBIDDEN);
  }
}

export class PayloadTooLarge<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.PAYLOAD_TOO_LARGE, 'Data exceeds the allowed size');
  }
}

export class FailedDependency<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.FAILED_DEPENDENCY);
  }
}

export class NotFound<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.NOT_FOUND, ALL_MESSAGES[NOT_FOUND]);
  }
}

export class TooManyRequests<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class RequestTimeout<TData> extends BaseException<TData> {
  constructor(payload: Payload<TData>) {
    super(payload, HttpStatus.REQUEST_TIMEOUT);
  }
}

export class QueryDbError extends BadRequest<any> {}

function reduceConstraintMsgs(validationErrors: NestValidationError[]): string[] {
  return validationErrors.reduce((acc, cur) => {
    const errorCodes = cur.contexts && Object.values(cur.contexts)
      .map(contex => contex?.errorCode)
      .filter(code => !!code);
    let ret = acc.concat(errorCodes ?? Object.values(cur?.constraints || {}));
    
    if (cur?.children)
      ret = ret.concat(reduceConstraintMsgs(cur?.children));
    
    return ret;
  }, []);
}

const regex = /^[A-Z_.]*[0-9]*$/;
export function solveErrorCode(validationErrors: NestValidationError[]) {
  let subStatus = VALIDATION;
  const constraintMsgs = reduceConstraintMsgs(validationErrors);
  const subStatuses = constraintMsgs
    .filter(message => regex.test(message))
    .sort();

  if (subStatuses.length)
    subStatus = subStatuses[0];
  
  return subStatus;
}

export class ValidationError extends BadRequest<any[]> {
  constructor(validationErrors: NestValidationError[]) {
    const subStatus = solveErrorCode(validationErrors);
    const payload: Payload<any[]> = {
      subStatus,
      message: ALL_MESSAGES[VALIDATION],
      data: validationErrors.reduce((acc, cur) => {
        if (acc.length === 0) {
          const item = { target: cur.target, error: [] };
          delete cur.target;
          item.error = [cur];
          acc.push(item);
          return acc;
        }
        delete cur.target;
        acc[0].error.push(cur);
        return acc;
      }, []),
    };
    super(payload);
  }
}

export class BaseRpcException extends RpcException {}
