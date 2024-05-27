import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import _ from 'lodash';

import { BaseException, Forbidden, Unauthorized } from '@base/api/exception';
import { Logger, LoggingService } from '@base/logging';

import { AccountService } from '@providers/backdoor/account/account.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'user_guard') {
  private logger: Logger = this.loggingService.getLogger(JwtStrategy.name);

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
      const bizAlias = this._getBizAlias(req);

      if (!userToken || !bizAlias) {
        throw new Unauthorized({
          subStatus: 'AUTH.UNAUTHORIZED',
        });
      }

      const user = await this.accountService.checkUserPermission(bizAlias, userToken);
      return user;
    } catch (error) {
      if (error instanceof BaseException)
        throw error;

      this.logger.error(error?.stack);
      throw new Forbidden({
        subStatus: 'AUTH.AUTH_ERROR',
      });
    }
  }

  private _getBizAlias(req: FastifyRequest) {
    return _.get(req.params, 'bizAlias');
  }
}
