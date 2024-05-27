/* eslint-disable @typescript-eslint/default-param-last */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as _ from 'lodash';
import { isUndefined } from '@nestjs/common/utils/shared.utils';

import { IAccountAuth } from '@providers/backdoor/account/account.interface';

export interface IAddParamsToBodyArgs {
  paramSource?: string;
  paramDest?: string;
  injectDataTo?: string;
}

function modifyRequest(req: Record<string, any>, args: IAddParamsToBodyArgs) {
  const user = req.user;
  const { paramSource, paramDest, injectDataTo = 'body' } = args;

  const setValue = !paramSource ? user : _.get(user, paramSource, null);
  const setKey = paramDest
    ? paramDest
    : paramSource
      ? paramSource
      : 'user';

  _.set(req[injectDataTo], setKey, setValue);
  return req[injectDataTo];
}

// Body
export const AddUserToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return modifyRequest(req, args);
});

export const AddMultiUserToBody = createParamDecorator((multiArgs: IAddParamsToBodyArgs[], ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  multiArgs.map(args => {
    req.body = modifyRequest(req, args);
  });

  return req.body;
});

export const AddUserIdsToBody = createParamDecorator((args: IAddParamsToBodyArgs = {}, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  req.user.data.userIds = req.user.data.users.map(user => user.id);
  args.paramSource = 'data.userIds';
  args.paramDest = 'userIds';
  return modifyRequest(req, args);
});

export const AddBizIdToBody = createParamDecorator((args: IAddParamsToBodyArgs = {}, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args.paramSource = 'data.id';
  args.paramDest = 'bizId';
  return modifyRequest(req, args);
});

export const AddUserIdToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args.paramSource = 'viewer.id';
  return modifyRequest(req, args);
});

const AddCreatedByIdToBody = () => AddUserIdToBody({ paramDest: 'createdById' });
const AddUpdatedByIdToBody = () => AddUserIdToBody({ paramDest: 'updatedById' });

const AddAuthorToBody = createParamDecorator((args: IAddParamsToBodyArgs = {}, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user: IAccountAuth = req.user;
  const setValue = _.pick(user.viewer, ['id', 'name', 'picture', 'email']);
  _.set(req.body, args.paramDest, setValue);
  return req.body;
});
export const AddUpdatedByToBody = () => AddAuthorToBody({ paramDest: 'updatedBy' });
export const AddCreatedByToBody = () => AddAuthorToBody({ paramDest: 'createdBy' });

export const AddUpdatedByToEachBody = createParamDecorator((args: IAddParamsToBodyArgs = {}, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  const setValue = _.pick(user.viewer, ['id', 'name', 'picture', 'email']);

  if (Array.isArray(req.body)) {
    req.body.map(body => _.set(body, 'updatedBy', setValue));
  }

  return req.body;
});



// Query
export const AddUserToQuery = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  req.query.user = req.user;
  return req.query;
});

export const AddUserIdsToQuery = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  req.user.data.userIds = req.user.data.users.map(user => user.id);
  args.paramSource = 'data.userIds';
  args.injectDataTo = 'query';
  return modifyRequest(req, args);
});

export const AddBizIdToQuery = createParamDecorator((args: IAddParamsToBodyArgs = {}, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args.paramSource = 'data.id';
  args.paramDest = 'bizId';
  args.injectDataTo = 'query';
  return modifyRequest(req, args);
});

export const AddBizIdToQueryFilter = createParamDecorator((args: IAddParamsToBodyArgs = {}, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args.paramSource = 'data.id';
  args.paramDest = 'filter.bizId';
  args.injectDataTo = 'query';

  if (typeof req.query?.filter === 'string')
    try {
      req.query.filter = JSON.parse(req.query.filter);
    } catch (e) {
      return req.query;
    }
  else if (isUndefined(req.query.filter)) _.set(req.query, 'filter', {});

  return modifyRequest(req, args);
});

// Param
export const AddUserIdsToParam = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  req.user.data.userIds = req.user.data.users.map(user => user.id);
  args.paramSource = 'data.userIds';
  args.injectDataTo = 'params';
  return modifyRequest(req, args);
});

export const AddUserToParam = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  args.injectDataTo = 'params';
  return modifyRequest(req, args);
});
