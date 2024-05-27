import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiHideProperty, ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Type as NestType } from '@nestjs/common';
import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import * as _ from 'lodash';

import { TransformSort } from '@base/validators';

import { config } from '@config';

// PAGINATION
class PaginationSpecificationDto {
  @IsOptional()
  @IsPositive()
  @Type( () => Number)
  @Max(config.PAGINATION_PAGE_SIZE)
  limit?: number = config.PAGINATION_PAGE_SIZE;

  @IsOptional()
  @IsPositive()
  @Type( () => Number)
  page?: number = 1;
}

export class PaginationDto extends PickType(PaginationSpecificationDto, ['limit', 'page']) {
  // eslint-disable-next-line @typescript-eslint/typedef
  static readonly getSkip = (query?: Partial<PaginationSpecificationDto>) => {
    return ((query?.page || 1) - 1) * (query?.limit || config.PAGINATION_PAGE_SIZE);
  };
}

// SORT
export class SortSpecificationDto {
  @ApiPropertyOptional({
    type: String,
    example: 'id,-createdAt',
  })
  @IsOptional()
  @TransformSort()
  @IsObject()
  sort?: Record<string, any>;
}


// SEARCH
class SearchSpecificationDto {
  @ApiPropertyOptional({ description: 'Input text for search' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  searchType?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];
}
export class SearchDto extends PickType(SearchSpecificationDto, ['q', 'searchFields']) {}
export class SearchFieldsDto extends PickType(SearchSpecificationDto, ['q', 'searchFields']) {}


// QUERY
export class QuerySpecificationDto<TFilter = Record<string, any>> extends IntersectionType(
  PaginationDto,
  SortSpecificationDto,
  SearchDto,
) {
  filter?: TFilter;
}

export interface IFactoryOption {
  sortFields?: string[];
  searchFields?: string[];
  filterCls?: NestType;
  filterExample?: string | Record<string, any>;
  filterOptions?: ApiPropertyOptions;
}

export type FactoryType<TFilter> = NestType<Pick<QuerySpecificationDto<TFilter>, keyof QuerySpecificationDto<TFilter>>>;

export const factoryQueryDto = <TFilter>(options: IFactoryOption = {}): FactoryType<TFilter> => {
  let { filterExample = '{"createdById": 1}' } = options;
  if (typeof filterExample !== 'string')
    filterExample = JSON.stringify(filterExample);

  class Factory {
    @ApiPropertyOptional({
      type: String,
      example: 'id,-createdAt',
    })
    @IsNotEmpty()
    @TransformSort(options.sortFields)
    @IsObject()
    sort?: Record<string, any>;

    @ApiPropertyOptional({ name: 'searchFields[]' })
    @IsNotEmpty()
    @IsIn(options.searchFields, { each: true })
    @IsString({ each: true })
    @IsArray()
    searchFields?: string[] = options.searchFields;

    @ApiPropertyOptional({
      type: String,
      ...options.filterOptions,
      description: options.filterCls?.name + '<br>' 
        + (options.filterOptions?.description ? options.filterOptions?.description + '<br>'  : '')
        + 'example: ' + filterExample,
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => options.filterCls)
    filter?: TFilter;
  }
  class FactoryOptional extends PartialType(Factory) {}

  const pickOptionKeys = [];
  options.sortFields && pickOptionKeys.push('sort');
  options.searchFields && pickOptionKeys.push('searchFields');
  options.filterCls && pickOptionKeys.push('filter');

  let pickRequireKeys = [];
  if (options.filterOptions?.required ) {
    const removed = _.remove(pickOptionKeys, o => o === 'filter');
    pickRequireKeys = pickRequireKeys.concat(removed);
  }
  
  return options.filterOptions?.required 
    ? IntersectionType(
      PickType(FactoryOptional, pickOptionKeys),
      PickType(Factory, pickRequireKeys),
    )
    : PickType(FactoryOptional, pickOptionKeys);
};

export const factorySpecificationQueryDto = <TFilter>(options: IFactoryOption = {}): FactoryType<TFilter> => {
  class SpecificationDto extends IntersectionType(
    PaginationDto,
    SortSpecificationDto,
    SearchSpecificationDto,
    factoryQueryDto<TFilter>(options),
  ) {}

  return SpecificationDto;
};
