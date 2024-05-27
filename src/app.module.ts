import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RouterModule } from '@nestjs/core';

import { LoggingModule } from '@base/logging/logging.module';
import { RedisModule } from '@base/db/redis';
import { HealthAppModule, HealthModule } from '@base/health/health.module';
import { MongoModule } from '@base/db/mongo/mongo.module';

import { AccountModule } from '@providers/backdoor/account/account.module';
import { BackdoorModule as BackdoorProviderModule } from '@providers/backdoor/backdoor/backdoor.module';
import { IntegrationModule } from '@providers/backdoor/integration/integration.module';

import { config, ConfigModule } from '@config';
import { AuthModule } from '@modules/auth/auth.module';
import { RecipeModule } from '@modules/recipe/recipe.module';


const appModules = [
  AuthModule,
  HealthAppModule,
  RecipeModule,
];
const adminModules = [];

@Module({
  imports: [
    // Globals
    ConfigModule,
    LoggingModule,
    RedisModule,

    // Cores
    HealthModule,
    MongoModule,
    BullModule.forRoot({
      url: config.REDIS_URI,
      prefix: config.REDIS_KEY_PREFIX + 'bull',
      redis: {
        db: config.REDIS_STORAGE.QUEUE,
      },
    }),

    // Providers
    AccountModule,
    BackdoorProviderModule,
    IntegrationModule,

    // Apps
    ...appModules,
    ...adminModules,

    // Routes
    RouterModule.register([
      {
        path: `/${config.MODULE_ALIAS}/`,
        children: appModules,
      },
      {
        path: `/admin/${config.MODULE_ALIAS}/`,
        children: adminModules,
      },
    ]),

    RecipeModule,
  ],
})
export class AppModule {}
