import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BizService } from '@providers/backdoor/biz/biz.service';

import { config } from '@config';

const { BACKDOOR_HTTP_CONFIG } = config;

@Module({
  imports: [
    HttpModule.register(BACKDOOR_HTTP_CONFIG),
  ],
  providers: [BizService],
  exports: [BizService],
})
export class BizModule {}
