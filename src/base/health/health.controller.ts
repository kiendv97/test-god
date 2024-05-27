import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

import { LoggingService, Logger } from '@base/logging';
import { ApiOperation } from '@base/swagger';

import { config } from '@config';

@Controller('health')
export class HealthController {
  private logger: Logger = this.loggingService.getLogger(HealthController.name);

  constructor(
    private loggingService: LoggingService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @HealthCheck()
  async checkHealth() {
    return this.health
      .check([
        () => ({ sr: { status: 'up', version: config.SR.VERSION } }),
        async () => this.http.pingCheck('google', 'https://google.com'),
      ])
      .catch((e) => {
        this.logger.error(e.message);
        this.logger.warn(e.response?.error);
        return e.response;
      });
  }
}
