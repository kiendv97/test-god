import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as _ from 'lodash';

import { IAddParamsToBodyArgs } from '@base/api/decorators/add-user-to-body.decorator';

function modifyRequest(req: Record<string, any>, args: IAddParamsToBodyArgs) {
  const params = req.params;
  const { paramSource, paramDest, injectDataTo = 'body' } = args;

  const setValue = !paramSource ? params : _.get(params, paramSource, null);
  const setKey = paramDest
    ? paramDest
    : paramSource;

  _.set(req[injectDataTo], setKey, setValue);
  return req[injectDataTo];
}

// Body
export const AddParamToBody = createParamDecorator((args: IAddParamsToBodyArgs, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return modifyRequest(req, args);
});
