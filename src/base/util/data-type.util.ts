import { isObject } from 'lodash';
import { isNil } from '@nestjs/common/utils/shared.utils';

export function isDict(obj: any) {
  return isObject(obj) && !Array.isArray(obj);
}

export function toBool(value: any) {
  return [true, 'true', 'True', 'TRUE'].includes(value);
}

export function safeArray<T = any>(val: T[], defaultVal: T[] = []) {
  return !isNil(val) ? val : defaultVal;
}
