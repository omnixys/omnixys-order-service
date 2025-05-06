import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
// relativer Import
import { AppModule } from './app.module.js';
import { corsOptions } from './config/cors.js';
import { nodeConfig } from './config/node.js';
import { helmetHandlers } from './security/http/helmet.handler.js';
import { shutdownOtelSDK, startOtelSDK } from './config/otel.js';

const { httpsOptions, port } = nodeConfig;

const bootstrap = async () => {
  await startOtelSDK();
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(helmetHandlers, compression());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors(corsOptions);
  await app.listen(port);

  const gracefulShutdown = async () => {
    console.log('🛑 Beende Anwendung ...');
    await shutdownOtelSDK();
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

await bootstrap();
