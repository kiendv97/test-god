import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { IntegrationService } from '@providers/backdoor/integration/integration.service';

import { config } from '@config';

const { BACKDOOR_HTTP_CONFIG } = config;

@Module({
  imports: [
    HttpModule.register(BACKDOOR_HTTP_CONFIG),
  ],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class IntegrationModule {}
