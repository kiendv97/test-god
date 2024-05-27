import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, Length, Validate } from 'class-validator';
import { ApiHideProperty, ApiProperty, IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { GreaterThanOrEqual, IsIntPositive } from '@base/validators';
import { UserExistValidator } from '@base/validators/user-exist.validator';
import { HideCreatedByDto } from '@base/api/dtos/common-hide-property.dto';

export class MongoIdDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}

export class UserMongoIdDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

export class CustomerMongoIdDto {
  @IsNotEmpty()
  @IsMongoId()
  'customer.id': string;
}

export class BizMongoIdDto {
  @IsNotEmpty()
  @IsMongoId()
  bizId: string;
}

export class UserExistMongoIdDto {
  @IsNotEmpty()
  @IsMongoId()
  @Validate(UserExistValidator)
  userId: string;

  @ApiHideProperty()
  @IsOptional()
  userIds: string[];
}

export class DateTimeRangeDto {
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  @GreaterThanOrEqual('fromDate')
  toDate: string;
}

export class DateRangeDto {
  @IsNotEmpty()
  @IsDateString()
  @Length(10)
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  @Length(10)
  @GreaterThanOrEqual('fromDate')
  toDate: string;
}

export class BizIdDto {
  @IsNotEmpty()
  @IsMongoId()
  bizId: string;
}

export class UpdateOrderingDto extends IntersectionType(
  MongoIdDto,
  PickType(HideCreatedByDto, ['updatedBy']),
) {
  @IsNotEmpty()
  @IsIntPositive()
  ordering: number = 1;
}

export class CommonDto extends IntersectionType(
  MongoIdDto,
  UserMongoIdDto,
  DateTimeRangeDto,
  DateRangeDto,
  BizIdDto,
) {}

export class CommonOptionalDto extends PartialType(CommonDto) {}
