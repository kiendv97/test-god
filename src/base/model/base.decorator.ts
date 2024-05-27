import { SchemaOptions } from '@nestjs/mongoose/dist/decorators/schema.decorator';
import { Prop, Schema } from '@nestjs/mongoose';
import { applyDecorators } from '@nestjs/common';
import { isObject as _isObject } from 'lodash';
import { isMongoId } from 'class-validator';
import { PropOptions } from '@nestjs/mongoose/dist/decorators/prop.decorator';
import { Schema as MSchema } from 'mongoose';

import { ApiProperty, enumProperty } from '@base/swagger';
import { JsonObject } from '@base/api';

interface NestSchemaOptions extends SchemaOptions {
  excludes?: string[];
  excludesOnPopulate?: string[];
  extendExcludesOnPopulate?: string[];
  transform?: (obj, ret) => any;
}

function isObject(value: any) {
  return !isMongoId(value?.toString()) && _isObject(value);
}

function defaultExcludeOnPopulate(ret: Record<string, any>): string[] {
  const keys = Object.keys(ret);
  return keys.reduce((acc, key) => {
    const keyId = key + 'Id';
    keys.includes(keyId) && isObject(ret[key]) && acc.push(keyId);

    const keyIds = key.slice(0, key.length - 1) + 'Ids';
    keys.includes(keyIds) && Array.isArray(ret[key]) && ret[key].some(item => isObject(item)) && acc.push(keyIds);

    return acc;
  }, []);
}

export function NestSchema(options?: NestSchemaOptions) {
  return applyDecorators(
    Schema({
      timestamps: true,
      toJSON: {
        virtuals: true,
        transform: (obj, ret) => {
          delete ret._id;
          delete ret.__v;

          options?.excludes?.map(key => delete ret[key]);

          const excludesOnPopulate = options?.excludesOnPopulate ?? defaultExcludeOnPopulate(ret);
          excludesOnPopulate
            .concat(options?.extendExcludesOnPopulate ?? [])
            .map(key => isObject(ret[key]) && delete ret[key]);

          options?.transform?.(obj, ret);
        },
      },
      ...options,
    }),
  );
}

export const EnumColumn = (options: PropOptions & { enum: JsonObject }) =>
  applyDecorators(
    ApiProperty(enumProperty({ enum: options.enum })),
    Prop({ type: MSchema.Types.String, options }),
  );
