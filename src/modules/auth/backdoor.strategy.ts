import { Strategy } from 'passport-local';
import { ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { Forbidden, Unauthorized } from '@base/api/exception';

import { BackdoorService } from '@providers/backdoor/backdoor/backdoor.service';

@Injectable()
export class BackdoorStrategy extends PassportStrategy(Strategy, 'backdoor_guard') {
  constructor(private readonly backdoorService: BackdoorService) {
    super({
      usernameField: 'Bearer',
      passwordField: 'Bearer',
      passReqToCallback: true,
    });
  }

  authenticate(req: Request, options: Record<string, any>) {
    const userToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const request = Object.assign({}, req, { body: { Bearer: userToken } });
    return super.authenticate(request, options);
  }
  
  async validate(req: Request, backdoorToken: string) {
    try {
      if (!backdoorToken) {
        throw new Unauthorized({
          subStatus: 'BACKDOOR_AUTH.UNAUTHORIZED',
        });
      }

      return this.backdoorService.verifyToken(backdoorToken);
    } catch (error) {
      if (!(error instanceof Unauthorized))
        throw error;

      this.logger.error(error.stack);
      throw new Forbidden({
        subStatus: 'BACKDOOR_AUTH.AUTH_ERROR',
      });
    }
  }
}
