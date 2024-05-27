import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';

import { AllRole } from './role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AllRole[] | AllRole[][]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles.flat()),
    ApiForbiddenResponse({
      description: 'Access role: ' + (roles.length ? roles.flat().toString() : 'Block all'),
    }),
  );
};
