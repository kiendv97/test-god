
import { IResponse } from '@providers/backdoor/base/interfaces/response.interface';

export interface IModule {
  id: string;
  name: string;
  alias: string;
  groupIds: string[];
  tags: string[];
  isActive: boolean;
  isMain: boolean;
  type: string;
  weight: number;
}

export interface IAppAuth {
  id: string;
  module: IModule;
  scopes: string[];
  isActive: boolean;
}

export interface IVerifyBackdoor extends IResponse<IAppAuth> {
  setting: Record<string, any>;
}

interface IPublicBizAuth {
  id?: string;
  name?: string;
  alias?: string;
  picture?: string;
}

export type IVerifyPublicBiz = IResponse<IPublicBizAuth>;
