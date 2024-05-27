import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { Forbidden, Unauthorized } from '@base/api/exception';
import { Logger, LoggingService } from '@base/logging';

import { AccountService } from '@providers/backdoor/account/account.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'admin_guard') {
  private logger: Logger = this.loggingService.getLogger(JwtAdminStrategy.name);

  constructor(
    private readonly accountService: AccountService,
    private loggingService: LoggingService,
  ) {
    super({
      usernameField: 'Bearer',
      passwordField: 'Bearer',
      passReqToCallback: true,
    });
  }

  authenticate(req: FastifyRequest, options: Record<string, any>) {
    const userToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const request = Object.assign({}, req, { body: { Bearer: userToken } });
    return super.authenticate(request, options);
  }

  async validate(req: FastifyRequest, userToken: string) {
    try {
      if (!userToken) {
        throw new Unauthorized({
          subStatus: 'AUTH_ADMIN.UNAUTHORIZED',
        });
      }

      return this.accountService.me(userToken);
    } catch (error) {
      if (!(error instanceof Unauthorized))
        throw error;

      this.logger.error(error?.stack);
      throw new Forbidden({
        subStatus: 'AUTH_ADMIN.AUTH_ERROR',
      });
    }
  }
}
