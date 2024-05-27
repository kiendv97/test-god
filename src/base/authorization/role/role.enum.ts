export enum SystemRole {
  ADMIN = 'ADMIN',
  MOD = 'MOD',
  DEV = 'DEV',
}
export enum BizRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
}

export type AllRole = SystemRole | BizRole;

export const RoleGroup = {
  ...SystemRole,
  ...BizRole,
};
