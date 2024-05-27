import { ApiProperty } from '@nestjs/swagger';

export const defaultPayload = {
  status: 200,
  statusText: 'SUCCESS',
  subStatus: '000000',
  subStatusText: '',
  success: true,
  message: '',
  data: null,
};

export abstract class Payload<TData> {
  status?: number;
  statusText?: string;
  subStatus?: string;
  subStatusText?: string;
  success?: boolean;
  message?: string;
  data?: TData | null;
  meta?: PaginatedMeta;

  protected constructor(partial: Payload<TData>) {
    Object.assign(this, partial);
  }
}

class MetaCursor {
  @ApiProperty()
  after?: string;

  @ApiProperty()
  before?: string;
}

export class PaginatedMeta {
  @ApiProperty()
  total?: number;

  @ApiProperty()
  totalPage?: number;

  @ApiProperty()
  currentPage?: number;

  @ApiProperty()
  limit?: number;

  @ApiProperty()
  cursors?: MetaCursor;

  [s: string]: any;

  constructor(query: Record<string, any>, partial: PaginatedMeta) {
    Object.assign(this, {
      ...partial,
      limit: query.limit,
      currentPage: query.page,
      totalPage: partial.totalPage ?? Math.ceil(Number(partial.total) / Number(query.limit)),
    });
  }
}

export class PaginatedResult<TData> {
  @ApiProperty()
  meta: PaginatedMeta;

  @ApiProperty()
  data: TData[];

  constructor(data: TData[], query: Record<string, any>, partial: PaginatedMeta) {
    this.data = data;
    this.meta = new PaginatedMeta(query, partial);
  }
}
