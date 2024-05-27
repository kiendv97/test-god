import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import { ValidationError as NestValidationError } from '@nestjs/common/interfaces/external/validation-error.interface';
import { ValidationPipeOptions } from '@nestjs/common/pipes/validation.pipe';
import { plainToInstance } from 'class-transformer';

import { ValidationError } from '@base/api/exception';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(private readonly options?: ValidationPipeOptions) {
    super(options);
  }
  
  async transform(value: {  filter: any; elasticSearch: any }, metadata: ArgumentMetadata) {
    if (metadata.type === 'query' && value?.filter)
      try { value.filter = JSON.parse(value?.filter); } catch (e) { /* empty */ }
    if (metadata.type === 'query' && value?.elasticSearch)
      try { value.elasticSearch = JSON.parse(value?.elasticSearch); } catch (e) { /* empty */ }
    
    const { metatype } = metadata;
    if (!metatype) {
      return value;
    }
    
    const object = plainToInstance(metatype, value);
    if (typeof object?.generateGroups === 'function') {
      const groups = object.generateGroups();
      const validationPipe = new ValidationPipe({
        ...this.options,
        groups,
      });

      return validationPipe.transform(value, metadata);
    }
    return super.transform(value, metadata);
  }
}

export const exceptionFactory = (validationErrors: NestValidationError[] = []) => new ValidationError(validationErrors);
