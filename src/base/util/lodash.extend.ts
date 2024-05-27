import _ from 'lodash';

import { JsonObject } from '@base/api';

export const gets = (object: Record<string, any>, paths: string[], failureValue?: any) => {
  for (const path of paths) {
    const value = _.get(object, path);
    if (value)
      return value;
  }

  return failureValue;
};

export function flattenKeys(obj: JsonObject, parentKey: string = '', separator: string = '.'): JsonObject {
  return _.reduce(
    obj,
    (result, value, key) => {
      const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
      if (_.isPlainObject(value)) {
        return _.merge(result, flattenKeys(value, newKey, separator));
      } else {
        result[newKey] = value;
        return result;
      }
    },
    {},
  );
}

export const getDiffLeft = (objA: Record<string, any>, objB: Record<string, any>, ignoreKeys: string[] = [], includeKeys?: string[]) => {
  const objAFlat = flattenKeys(objA);
  const objBFlat = flattenKeys(objB);
  return Object.keys(objAFlat).reduce((acc, key) => {
    if (!ignoreKeys.includes(key) && (includeKeys?.includes(key) ?? true) && !_.isEqual(objAFlat[key], objBFlat[key]))
      acc[key] = objAFlat[key];

    return acc;
  }, {});
};

export const isNotTrue = (value: any) => value !== true;
