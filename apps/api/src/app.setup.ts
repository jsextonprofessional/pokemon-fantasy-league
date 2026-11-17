import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('v1');
  const config = new DocumentBuilder().setTitle('Fantasy League API').setVersion('0.0.0').build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}
