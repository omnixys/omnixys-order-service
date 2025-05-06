// src/kafka/kafka-event-dispatcher.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { KAFKA_EVENT_METADATA, KafkaEventContext, KafkaEventHandler } from './interface/kafka-event.interface.js';
import { getLogger } from '../logger/logger.js';
import { TraceContextUtil } from '../trace/trace-context.util.js';
import { TraceContextProvider } from '../trace/trace-context.provider.js';

@Injectable()
export class KafkaEventDispatcherService implements OnModuleInit {
    readonly #logger = getLogger(KafkaEventDispatcherService.name);
    private readonly handlerMap: Map<string, KafkaEventHandler> = new Map();

    readonly #discoveryService: DiscoveryService;
    readonly #reflector: Reflector;
    readonly #traceContextProvider: TraceContextProvider;

    constructor(
        discoveryService: DiscoveryService,
        reflector: Reflector,
        traceContextProvider: TraceContextProvider,
    ) {
        this.#discoveryService = discoveryService;
        this.#reflector = reflector;
        this.#traceContextProvider = traceContextProvider;
    }

    onModuleInit(): void {
        const providers = this.#discoveryService.getProviders();

        for (const wrapper of providers) {
            const { instance } = wrapper;
            if (!instance) continue;

            const eventName = this.#reflector.get<string>(KAFKA_EVENT_METADATA, instance.constructor);
            if (!eventName) continue;

            this.#logger.debug(`🧠 Registriere Handler für Event: ${eventName}`);
            this.handlerMap.set(eventName, instance);
        }
    }

    async dispatch(eventName: string, payload: any, context: KafkaEventContext): Promise<void> {
        this.#logger.debug('dispatch: eventName=%s, payload=%o, context=%o', eventName, payload, context);

        const handler = this.handlerMap.get(eventName);
        if (!handler) {
            this.#logger.warn(`Kein Handler für Event "${eventName}" registriert`);
            return;
        }

        const traceContext = TraceContextUtil.fromHeaders(context.headers);
        this.#traceContextProvider.setContext(traceContext);

        try {
            await handler.handle(payload, context);
        } catch (error) {
            this.#logger.error(`Fehler bei Event "${eventName}":`, error);
        }
    }
}
