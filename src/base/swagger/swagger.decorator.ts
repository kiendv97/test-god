import {
  ApiOperation as SwgOperation,
  ApiTags as SwgApiTags,
  ApiParam, ApiOkResponse, getSchemaPath, ApiExtraModels,
} from '@nestjs/swagger';
import { ApiOperationOptions } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiParamOptions } from '@nestjs/swagger/dist/decorators/api-param.decorator';

import { PaginatedMeta, PaginatedResult } from '@base/api';

export * from '@nestjs/swagger';

const createApiOperation = (defaultOptions: ApiOperationOptions) => {
  return (options?: ApiOperationOptions & { bizAliasOptions?: Partial<ApiParamOptions>; noBiz?: boolean }): MethodDecorator =>
    options?.noBiz
    ? applyDecorators(
        SwgOperation({
          ...defaultOptions,
          ...options,
        }),
      )
    : applyDecorators(
      SwgOperation({
        ...defaultOptions,
        ...options,
      }),
      ApiParam({
        name: 'bizAlias',
        type: 'string',
        example: 'test',
        required: true,
        ...options?.bizAliasOptions,
      }),
    );
};

export const SUMMARIES = {
  LIST: 'Liệt kê danh sách bản ghi',
  RETRIEVE: 'Lấy thông tin chi tiết 1 bản ghi',
  CREATE: 'Tạo mới 1 bản ghi',
  UPDATE: 'Sửa 1 bản ghi',
  UPSERT: 'Sửa 1 bản ghi hoặc tạo mới nếu chưa tồn tại',
  DELETE: 'Xoá 1 bản ghi',
  BULK_DELETE: 'Xoá hàng loạt',
};

export const ApiOperation = createApiOperation({ summary: 'Summary description' });
export const ApiListOperation = createApiOperation({ summary: SUMMARIES.LIST });
export const ApiRetrieveOperation = createApiOperation({ summary: SUMMARIES.RETRIEVE });
export const ApiCreateOperation = createApiOperation({ summary: SUMMARIES.CREATE });
export const ApiUpdateOperation = createApiOperation({ summary: SUMMARIES.UPDATE });
export const ApiUpsertOperation = createApiOperation({ summary: SUMMARIES.UPSERT });
export const ApiPartialOperation = createApiOperation({ summary: SUMMARIES.UPDATE });
export const ApiDeleteOperation = createApiOperation({ summary: SUMMARIES.DELETE });
export const ApiBulkDeleteOperation = createApiOperation({ summary: SUMMARIES.BULK_DELETE });
export const ApiBulkUpdateOperation = createApiOperation({ summary: 'Sửa nhiều bản ghi' });
export const ApiUpdateManyOperation = createApiOperation({ summary: 'Sửa nhiều bản ghi có dữ liệu cập nhật khác nhau' });

export function ApiTagsAndBearer(...tags: string[]) {
  return applyDecorators(
    SwgApiTags(...tags),
  );
}

export const ApiPaginatedResponse = <TModel extends Type>(model?: TModel) => {
  return applyDecorators(
    ApiExtraModels(... model ? [PaginatedResult, model] : [PaginatedResult]),
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf ${model?.name}`,
        allOf: [
          { $ref: getSchemaPath(PaginatedResult) },
          {
            properties: {
              total: {
                type: 'number',
              },
              data: {
                type: 'array',
                items: model ? { $ref: getSchemaPath(model) } : undefined,
              },
              meta: {
                items: { $ref: getSchemaPath(PaginatedMeta) },
              },
            },
          },
        ],
      },
    }),
  );
};
