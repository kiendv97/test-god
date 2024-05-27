import { ValidationArguments } from 'class-validator';

import { ValidatorExistType } from '@base/validators/validator-exist.validator';

export interface BizIdValidationArguments<TObject = any> extends ValidationArguments {
  object: {
    bizId: number;
  } & TObject;
  constraints: [ValidatorExistType];
}

export interface BizAndIdValidationArguments<TObject = any> extends ValidationArguments {
  object: {
    bizId: number;
    id: number;
  } & TObject;
  constraints: [ValidatorExistType];
}
