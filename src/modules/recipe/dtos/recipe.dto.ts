import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class CreateRecipeIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;
}

class CreateRecipeStepDto {

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  stepOrder: number;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsString()
  pictureUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeStepDto)
  steps: CreateRecipeStepDto[];
}

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}

export class CreateStepDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}