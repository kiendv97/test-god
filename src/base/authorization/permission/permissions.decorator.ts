import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';

/**
 * Assign access permissions according to the user's role at the controller
 * Applies to both classes and functions
 * Perms in function will override (ignore) Perms of class
 */
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    ApiForbiddenResponse({
      description: 'Access perms: ' + permissions.toString(),
    }),
  );
