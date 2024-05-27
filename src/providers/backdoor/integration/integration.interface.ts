import { IBatchResponse } from '@providers/backdoor/base';

interface IZaloOa {
  oaId: string;
  accessToken: string;
  refreshToken: string;
  expiredTokenTime: string;
}

export interface IIntegration {
  id: string;
  bizId: string;
  name: string;
  desc?: string;
  platform: string;
  isActive: boolean;
  zalo_oa: IZaloOa;
  isRequestHit: number;
}

export type IIntegrationFindOne = IBatchResponse<IIntegration>;
