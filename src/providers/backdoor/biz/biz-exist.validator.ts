import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { BizService } from '@providers/backdoor/biz/biz.service';

@ValidatorConstraint({ name: 'BizExistValidator', async: true })
@Injectable()
export class BizExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly service: BizService) { /* */ }

  async validate(value: string) {
    try {
      const biz = await this.service.findOne(value);
      return !!biz;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(): string {
    return 'BIZ.ID_NOT_EXIST';
  }
}
