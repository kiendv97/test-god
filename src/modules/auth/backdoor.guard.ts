import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class BackdoorGuard extends AuthGuard('backdoor_guard') {}
