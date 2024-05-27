import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import * as exc from '@base/api/exception';
import { ROLES_KEY } from '@base/authorization';

import { IAccountAuth } from '@providers/backdoor/account/account.interface';


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(protected reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles?.length) {
      return true;
    }

    const { user }: { user: IAccountAuth } = context.switchToHttp().getRequest();
    const matchModuleRole = RoleGuard.matchRoles(requireRoles, user?.data?.user?.role);
    const matchGlobalRole = RoleGuard.matchRoles(requireRoles, user?.viewer?.role);

    if (!(matchModuleRole || matchGlobalRole))
      throw new exc.Forbidden({
        subStatus: 'ROLE.INSUFFICIENT_AUTHORITY',
      });
    return true;
  }

  private static matchRoles(requireRoles: string[], userRole: string) {
    return requireRoles.some(role => role === userRole);
  }
}
