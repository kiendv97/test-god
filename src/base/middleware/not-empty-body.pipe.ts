import { PipeTransform, Injectable } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { ArgumentMetadata } from '@nestjs/common/interfaces/features/pipe-transform.interface';

import { BadRequest, VALIDATION } from '@base/api/exception';

@Injectable()
export class NotEmptyBodyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (isNil(value)) {
      throw new BadRequest({
        subStatus: VALIDATION,
        subStatusText: 'Request body must defined and could be an empty JSON object',
      });
    }
    return value;
  }
}

@Injectable()
export class BDoorDataNotEmptyPipe extends NotEmptyBodyPipe {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || metadata.data !== 'data')
      return value;

    return super.transform(value, metadata);
  }
}
