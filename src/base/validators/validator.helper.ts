import { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { exceptionFactory } from '@base/middleware/custom-validation.pipe';
import { ValidationError } from '@base/api/exception';

export async function handleValidate(classDto: Type, input: any, isReject: boolean = true) {
  const dto = plainToInstance(classDto, input);
  const errors = await validate(dto, {
    exceptionFactory,
    whitelist: true,
    stopAtFirstError: true,
    forbidUnknownValues: false,
  });

  if (errors.length && isReject)
    throw new ValidationError(errors);

  return {
    dto,
    errors,
    isError: !!errors.length,
  };
}
