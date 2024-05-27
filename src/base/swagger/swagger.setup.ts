import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

import { config } from '@config';

export function initSwagger(app: INestApplication) {
  if (config.NODE_ENV === config.PROD) return;

  const SR = config.SR;
  const configSwagger = new DocumentBuilder()
    .setTitle(SR.PRODUCT_NAME)
    .setDescription('Description document for Rest API')
    .setVersion(SR.VERSION)
    .setContact(SR.SIGNATURE, SR.SUPPORT.URL, SR.SUPPORT.EMAIL)
    .setExternalDoc('Backend overview', config.HOST + '/overview')
    .addServer(config.HOST, 'Current server')
    .addServer('https://' + config.PUBLIC_IP, 'Current server throw nginx')
    .addServer('http://localhost:' + String(config.PORT), 'Localhost')
    .addServer('http://localhost:4103', 'Localhost 4103')
    .addServer('http://localhost:4104', 'Localhost 4104')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('/apidoc', app, document, {
    customSiteTitle: SR.PRODUCT_NAME + ' API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  });
}
