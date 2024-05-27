import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AccountService } from '@providers/backdoor/account/account.service';

import { config } from '@config';

const { BACKDOOR_HTTP_CONFIG } = config;

@Module({
  imports: [
    HttpModule.register(BACKDOOR_HTTP_CONFIG),
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
