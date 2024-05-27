import _ from 'lodash';
import { isNil } from '@nestjs/common/utils/shared.utils';

import { AccountPublicItems, AccountPublicSimple, IAccountAuth } from '@providers/backdoor/account/account.interface';
import { Biz } from '@providers/backdoor/biz/biz.class';

interface IFunctionOptions {
  mapToDoc?: boolean; // default: true
}

interface Mapping {
  mapId: string;
  mapTo: string;
}

export function mappingUserList(data: any[], mapId: string, mapTo: string, user?: IAccountAuth, options?: IFunctionOptions) {
  if (!user)
    return data;

  const users = new AccountPublicItems(user.data.users);
  const userSimpleObject = users.toObject<AccountPublicSimple>(users.simple);

  return data.map(item => {
    const userSimple = userSimpleObject[_.get(item, mapId)];
    isNil(options?.mapToDoc) || options?.mapToDoc
      ? _.set(item._doc, mapTo, userSimple)
      : _.set(item, mapTo, userSimple);
    return item;
  });
}

export function bulkMappingUserList(data: any[], mapArr: Mapping[], user?: IAccountAuth, options?: IFunctionOptions) {
  if (!user)
    return data;

  const users = new AccountPublicItems(user.data.users);
  const userSimpleObject = users.toObject<AccountPublicSimple>(users.simple);

  return data.map(item => {
    mapArr.forEach(({ mapId, mapTo }) => {
      const userSimple = userSimpleObject[_.get(item, mapId)];
      isNil(options?.mapToDoc) || options?.mapToDoc
        ? _.set(item._doc, mapTo, userSimple)
        : _.set(item, mapTo, userSimple);
    });
    return item;
  });
}

export function mappingUserByBiz(item: any, mapId: string, mapTo: string, biz?: Biz, options?: IFunctionOptions) {
  if (!biz?.users)
    return item;

  const users = new AccountPublicItems(biz.users);
  const userSimpleObject = users.toObject<AccountPublicSimple>(users.simple);

  const userSimple = userSimpleObject[_.get(item, mapId)];
  isNil(options?.mapToDoc) || options?.mapToDoc
    ? _.set(item._doc, mapTo, userSimple)
    : _.set(item, mapTo, userSimple);
  return item;
}

export function bulkMappingUserByBiz(item: any, mapArr: Mapping[], biz?: Biz, options?: IFunctionOptions) {
  if (!biz?.users)
    return item;

  const users = new AccountPublicItems(biz.users);
  const userSimpleObject = users.toObject<AccountPublicSimple>(users.simple);

  mapArr.forEach(({ mapId, mapTo }) => {
    const userSimple = userSimpleObject[_.get(item, mapId)];
    isNil(options?.mapToDoc) || options?.mapToDoc
      ? _.set(item._doc, mapTo, userSimple)
      : _.set(item, mapTo, userSimple);
  });
  return item;
}

export function mappingUser(item: any, mapId: string, mapTo: string, user?: IAccountAuth, options?: IFunctionOptions) {
  return mappingUserByBiz(item, mapId, mapTo, user?.data, options);
}

export function bulkMappingUser(item: any, mapArr: Mapping[], user?: IAccountAuth, options?: IFunctionOptions) {
  return bulkMappingUserByBiz(item, mapArr, user?.data, options);
}
