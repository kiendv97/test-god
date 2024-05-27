import { IsOptional } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';

import { Author } from '@base/model';

class HideCreatedIdDto {
  @ApiHideProperty()
  @IsOptional()
  createdById?: string;

  @ApiHideProperty()
  @IsOptional()
  updatedById?: string;
}

export class HideCreatedByDto {
  @ApiHideProperty()
  @IsOptional()
  createdBy?: Author;

  @ApiHideProperty()
  @IsOptional()
  updatedBy?: Author;
}

class HideBizCreatedIdDto extends HideCreatedIdDto {
  @ApiHideProperty()
  @IsOptional()
  bizId?: string;
}

export class HideBizCreatedByDto extends HideCreatedByDto {
  @ApiHideProperty()
  @IsOptional()
  bizId?: string;
}

export class HideBizIdDto {
  @ApiHideProperty()
  @IsOptional()
  bizId?: string;
}

export class HideUserIdsDto {
  @ApiHideProperty()
  @IsOptional()
  userIds?: string[];
}

export class HideBizAuthorDto extends HideBizIdDto {
  @ApiHideProperty()
  @IsOptional()
  author?: Author;

  @ApiHideProperty()
  @IsOptional()
  updatedBy?: Author;
}

export class HideIdDto {
  @ApiHideProperty()
  @IsOptional()
  id?: string;
}
