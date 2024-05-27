import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AccountModule } from '@providers/backdoor/account/account.module';
import { BackdoorModule } from '@providers/backdoor/backdoor/backdoor.module';

import { JwtGuard } from '@modules/auth/jwt.guard';
import { JwtStrategy } from '@modules/auth/jwt.strategy';
import { BackdoorStrategy } from '@modules/auth/backdoor.strategy';
import { BackdoorGuard } from '@modules/auth/backdoor.guard';
import { JwtAdminGuard } from '@modules/auth/jwt-admin.guard';
import { JwtAdminStrategy } from '@modules/auth/jwt-admin.strategy';

@Module({
  imports: [
    AccountModule,
    BackdoorModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    JwtGuard,
    JwtStrategy,
    JwtAdminGuard,
    JwtAdminStrategy,
    BackdoorGuard,
    BackdoorStrategy,
  ],
})
export class AuthModule {}
