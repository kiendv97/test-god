import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

import {
  PaginationDto, SearchDto,
} from '@base/api/dtos/query-specification.dto';

export class ListBizQueryDto extends IntersectionType(
  PaginationDto,
  SearchDto,
) {
  @ApiPropertyOptional({ name: 'ids[]' })
  @IsOptional()
  @IsMongoId({ each: true })
  ids?: string[];
}
