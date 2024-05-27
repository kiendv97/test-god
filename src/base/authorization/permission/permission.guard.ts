import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import _ from 'lodash';

import * as exc from '@base/api/exception';
import { SystemRole } from '@base/authorization';

import { IAdminAuth } from '@providers/backdoor/account/account.interface';

import { config } from '@config';

import { PERMISSIONS_KEY } from './permissions.decorator';


@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(protected reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirePerms: string[] = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requirePerms?.length) {
      return true;
    }

    const { user }: { user: IAdminAuth } = context.switchToHttp().getRequest();

    switch (user?.viewer?.role) {
      case SystemRole.ADMIN:
        return true;
      case SystemRole.DEV:
        return config.NODE_ENV !== config.PROD && user?.viewer?.devScopes?.includes(config.MODULE_ALIAS);
      case SystemRole.MOD:
        break;
      default:
        throw new exc.Forbidden({
          subStatus: 'PERMISSION.INSUFFICIENT_SYSTEM_ROLE',
        });
    }

    const userPerms = _.keyBy(user?.viewer?.modScopes, 'moduleAlias')[config.MODULE_ALIAS]?.moduleScopes ?? [];
    const matchPerm = PermissionGuard.matchPerms(requirePerms, userPerms);

    if (!matchPerm)
      throw new exc.Forbidden({
        subStatus: 'PERMISSION.INSUFFICIENT_AUTHORITY',
      });

    return true;
  }

  private static matchPerms(requirePerms: string[], userPerms: string[]) {
    return requirePerms.some(perm => userPerms.includes(perm));
  }
}
