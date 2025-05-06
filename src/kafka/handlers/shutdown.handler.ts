// src/kafka/handlers/shutdown.handler.ts
import { Injectable } from '@nestjs/common';
import { KafkaEventHandler } from '../interface/kafka-event.interface.js';
import { KafkaEvent } from '../decorators/kafka-event.decorator.js';
import { KafkaTopics } from '../kafka-topic.properties.js';
import { getLogger } from '../../logger/logger.js';

@KafkaEvent(KafkaTopics.system.shutdownAll)
@Injectable()
export class ShutdownHandler implements KafkaEventHandler {
    readonly #logger = getLogger(ShutdownHandler.name);

    async handle(): Promise<void> {
        this.#logger.warn('Shutdown signal empfangen – Anwendung wird beendet …');

        // optional: Cleanup (DB schließen, etc.)

        // Sanfter Exit (empfohlen bei Kafka + Nest)
        setTimeout(() => {
            process.exit(0); // 🛑 Beendet Node.js sauber
        }, 100);
    }
}
