import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Type } from '@nestjs/common';
import { OmitType, PartialType, PickType } from '@nestjs/swagger';

export function enumToObj(enumVariable: Record<string, any>): Record<string, any> {
  const enumValues = Object.values(enumVariable);
  const enumKeys = Object.keys(enumVariable).filter(key => !enumValues.includes(parseInt(key)));
  const object = {};
  for (const enumKey of enumKeys) {
    object[enumKey] = enumVariable[enumKey];
  }
  return object;
}

export function enumProperty(options: ApiPropertyOptions): ApiPropertyOptions {
  const obj = enumToObj(options.enum);
  const enumValues = Object.values(obj);
  return {
    example: enumValues[0],
    ...options,
    enum: options.enum,
    description: (options.description ? options.description + ': ' : '') + JSON.stringify(obj, null, 4),
  };
}

export function PartialOmitType<T, K extends keyof T>(classRef: Type<T>, keys: readonly K[]): Type<Partial<Omit<T, typeof keys[number]>>> {
  return PartialType(OmitType(classRef, keys));
}

export function PartialPickType<T, K extends keyof T>(classRef: Type<T>, keys: readonly K[]): Type<Partial<Pick<T, typeof keys[number]>>> {
  return PartialType(PickType(classRef, keys));
}
