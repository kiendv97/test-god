import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

interface MyValidationArguments extends ValidationArguments {
  object: {
    userIds: string[];
  };
}

@ValidatorConstraint({ name: 'UsersExistValidator', async: true })
@Injectable()
export class UsersExistValidator implements ValidatorConstraintInterface {
  validate(values: string[], args: MyValidationArguments) {
    const userIds = args.object.userIds;
    return values?.length && values.every(value => userIds.includes(value));
  }

  defaultMessage(): string {
    return 'USER.ID_NOT_EXIST';
  }
}

@ValidatorConstraint({ name: 'UserExistValidator', async: true })
@Injectable()
export class UserExistValidator implements ValidatorConstraintInterface {
  validate(value: string, args: MyValidationArguments) {
    const userIds = args.object.userIds;
    return userIds?.includes(value);
  }

  defaultMessage(): string {
    return 'USER.ID_NOT_EXIST';
  }
}
