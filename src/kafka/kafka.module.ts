import { DiscoveryModule } from '@nestjs/core';
import { KafkaConsumerService } from './kafka-consumer.service.js';
import { KafkaProducerService } from './kafka-producer.service.js';
import { forwardRef, Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module.js';
import { KafkaEventDispatcherService } from './kafka-event-dispatcher.service.js';
import { KafkaHeaderBuilder } from './kafka-header-builder.js';
import { ShutdownHandler } from './handlers/shutdown.handler.js';

@Module({
    imports: [
        DiscoveryModule,
        forwardRef(() => OrderModule),
    ],
    providers: [
        KafkaProducerService,
        KafkaConsumerService,
        KafkaEventDispatcherService,
        KafkaHeaderBuilder,
        ShutdownHandler,
    ],
    exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule { }
