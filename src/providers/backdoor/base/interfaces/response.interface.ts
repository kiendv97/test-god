import { PaginatedMeta } from '@base/api';

import { GetMeData } from '@providers/backdoor/account/account.interface';

export interface IResponse<T> {
  status: number;
  statusText: string;
  data: T;
  meta?: PaginatedMeta;
  total?: number;
}

export interface IViewerResponse<T> {
  status: number;
  statusText: string;
  data: T;
  viewer: GetMeData;
}

export interface IBatchData<T, TQuery = any> {
  method: string;
  response: IResponse<T>;
  query: TQuery;
}

export interface IBatchResponse<T, TQuery = any> {
  status: number;
  statusText: string;
  data: IBatchData<T, TQuery>[];
}
