import { IBatchResponse } from '@providers/backdoor/base/interfaces/response.interface';
import { AccountPublic, RoleBizItem } from '@providers/backdoor/account/account.interface';

export class Biz {
  id: string;
  name: string;
  alias: string;
  picture?: string;
  timezone?: string;
  isActive: boolean;
  location?: string;
  authorId: string;
  author?: Record<string, any>;

  modules: [];
  users: AccountPublic[];
  roles: RoleBizItem[];
}

export type IBizFindOne = IBatchResponse<Biz>;
export type IBizFindMany = IBatchResponse<Biz[]>;
