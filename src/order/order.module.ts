import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderReadService } from './service/order-read.service.js';
import { OrderQueryBuilder } from './service/query-builder.js';
import { KeycloakModule } from '../security/keycloak/keycloak.module.js';
import { OrderWriteService } from './service/order-write.service.js';
import { entities } from './model/entities/entities.js';
import { OrderQueryResolver } from './resolver/order-query.resolver.js';
import { OrderMutationResolver } from './resolver/order-mutation.resolver.js';
import { ClientModule } from '../clients/client.module.js';
import { KafkaModule } from '../messaging/kafka.module.js';

@Module({
    imports: [forwardRef(() => KafkaModule), KeycloakModule, TypeOrmModule.forFeature(entities), ClientModule],
    // Provider sind z.B. Service-Klassen fuer DI
    providers: [
        OrderReadService,
        OrderWriteService,
        OrderQueryBuilder,
        OrderQueryResolver,
        OrderMutationResolver,
    ],
    // Export der Provider fuer DI in anderen Modulen
    exports: [OrderReadService, OrderWriteService],
})
export class OrderModule { }
