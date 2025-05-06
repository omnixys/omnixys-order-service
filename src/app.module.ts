import { type ApolloDriverConfig } from '@nestjs/apollo';
import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module.js';
import { DevModule } from './config/dev/dev.module.js';
import { typeOrmModuleOptions } from './config/typeormOptions.js';
import { LoggerModule } from './logger/logger.module.js';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware.js';
import { KafkaModule } from './kafka/kafka.module.js';
import { KeycloakModule } from './security/keycloak/keycloak.module.js';
import { OrderModule } from './order/order.module.js';
import { graphQlModuleOptions2 } from './config/graphql.js';
import { TraceModule } from './trace/trace.module.js';

@Module({
  imports: [
    AdminModule,
    DevModule,
    OrderModule,
    GraphQLModule.forRoot<ApolloDriverConfig>(graphQlModuleOptions2),
    LoggerModule,
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    KafkaModule,
    KeycloakModule,
    TraceModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('auth', 'graphql');
  }
}
