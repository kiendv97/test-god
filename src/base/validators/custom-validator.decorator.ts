import {
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
  IsPositive,
  IsInt,
  Min,
  IsDateString, Length, IsNumber, ValidateNested,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import ValidatorJS from 'validator';
import { TypeHelpOptions, TypeOptions } from 'class-transformer/types/interfaces';
import { Type } from 'class-transformer';

export function GreaterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'GreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(propertyValue: number, args: ValidationArguments) {
          return propertyValue > args.object[args.constraints[0]];
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be greater than "${String(args.constraints[0])}"`;
        },
      },
    });
  };
}

export function GreaterThanOrEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'GreaterThanOrEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(propertyValue: number, args: ValidationArguments) {
          return propertyValue >= args.object[args.constraints[0]];
        },
        defaultMessage(args: ValidationArguments) {
          return `"${args.property}" must be greater than or equal to "${String(args.constraints[0])}"`;
        },
      },
    });
  };
}

export function IsIntPositive(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsPositive(validationOptions),
    IsInt(validationOptions),
  );
}

export function IsIntNatural(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Min(0, validationOptions),
    IsInt(validationOptions),
  );
}

export function IsNumberNatural(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Min(0, validationOptions),
    IsNumber({ allowNaN: false, allowInfinity: false }, validationOptions),
  );
}

export function IsDateOnlyStrict(options?: ValidatorJS.IsISO8601Options, validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsDateString({ strict: true, ...options }, validationOptions),
    Length(10, 10, validationOptions),
  );
}

export function IsDateTimeStrict(options?: ValidatorJS.IsISO8601Options, validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsDateString({ strict: true, ...options }, validationOptions),
    Length(20, 20, validationOptions),
  );
}

export function IsNumberOrString(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsNumberOrString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(propertyValue: any, args: ValidationArguments) {
          return typeof propertyValue === 'number' || typeof propertyValue === 'string';
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be number or string`;
        },
      },
    });
  };
}

export function NestedType(typeFunction?: (type?: TypeHelpOptions) => any, validationOptions?: ValidationOptions, options?: TypeOptions) {
  return applyDecorators(
    ValidateNested(validationOptions),
    Type(typeFunction, options),
  );
}
