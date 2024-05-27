import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BackdoorService } from '@providers/backdoor/backdoor/backdoor.service';

import { config } from '@config';

const { BACKDOOR_HTTP_CONFIG } = config;

@Module({
  imports: [
    HttpModule.register(BACKDOOR_HTTP_CONFIG),
  ],
  providers: [BackdoorService],
  exports: [BackdoorService],
})
export class BackdoorModule {}
