import { pick } from 'lodash';
import { PartialType } from '@nestjs/swagger';

import { BizRole, SystemRole } from '@base/authorization';

import { IResponse, IViewerResponse } from '@providers/backdoor/base/interfaces/response.interface';
import { Biz } from '@providers/backdoor/biz/biz.class';
import { IModule } from '@providers/backdoor/backdoor/backdoor.interface';


export class RoleBizItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  isActive: boolean;
}

export class AccountPublic {
  id: string;
  name: string;
  email: string;
  role: BizRole;
  roleIds: string[];
  roles: RoleBizItem[];
  isActive: boolean;
  picture: string;
  createdAt: string;
  isFollowReport?: boolean;
  modules?: IModule[];

  constructor(partial: AccountPublic) {
    Object.assign(this, partial);
  }

  get simple(): AccountPublicSimple {
    return pick(this, ['id', 'name', 'email', 'role', 'picture', 'isActive', 'createdAt' ]);
  }
}

export class AccountPublicSimple extends PartialType(AccountPublic) {}

export class AccountPublicItems {
  users: AccountPublic[];

  constructor(partials: AccountPublic[]) {
    this.users = partials.map(user => new AccountPublic(user));
  }

  get simple(): AccountPublicSimple[] {
    return this.users.map(user => user.simple);
  }

  toObject<T = AccountPublic | AccountPublicSimple>(users: (T & AccountPublicSimple)[]): Record<string, T> {
    return Object.fromEntries<T>(
      users.map<[string, T]>(user => [user.id, user]),
    );
  }
}

interface IBizModuleAccount extends Biz {
  // User
  user: AccountPublic;

  // Module
  module: Record<string, any>;
}

export interface IAccountAuth extends IViewerResponse<IBizModuleAccount> {
  setting: Record<string, any>;
  refToken: string;
}

export interface IJwt {
  id?: string;
  env?: string;
  iat?: number;
  exp?: number;
}

export class GetMeData {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  isActive: boolean;
  picture: string;
  createdAt: string;

  devScopes: string[];
  modScopes: {
    moduleAlias: string;
    moduleScopes: string[];
  }[];
}

export type IGetMe = IResponse<GetMeData>;
export type IAdminAuth = IViewerResponse<null>;
