import { ValidationArguments } from 'class-validator';
import Debug from 'debug';

const debug = Debug('backend:exist_validator');

export enum ValidatorExistType {
  EXISTED,
  NOT_EXIST,
}

export const isExistedType = (existType: ValidatorExistType) => existType !== ValidatorExistType.NOT_EXIST;
export const isArgsExistedType = (args: any) => isExistedType((args.constraints || [])[0]);

export class ExistValidator {
  protected message: string = '';

  defaultMessage(): string {
    return this.message;
  }

  validateCount(count: number, args: ValidationArguments, errorCode?: string) {
    const shouldExisted = isArgsExistedType(args);
    debug({ errorCode, count, shouldExisted });

    if (count && !shouldExisted) {
      this.message = errorCode + '_EXISTED';
      return false;
    }

    if (!count && shouldExisted) {
      this.message = errorCode + '_NOT_EXIST';
      return false;
    }

    return true;
  }

  validateCountMany(values: any[], count: number, args: ValidationArguments, errorCode?: string) {
    if (count !== values.length) {
      this.message = errorCode + '_NOT_EXIST';
      return false;
    }

    return true;
  }
}
