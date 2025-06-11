// src/messaging/handlers/orchestrator.handler.ts
import { Injectable } from '@nestjs/common';
import { KafkaEventHandler } from '../interface/kafka-event.interface.js';
import {
  KafkaEvent,
  KafkaHandler,
} from '../decorators/kafka-event.decorator.js';
import { KafkaTopics } from '../kafka-topic.properties.js';
import { getLogger } from '../../logger/logger.js';
import { Trace } from '../../trace/trace.decorator.js';

@KafkaHandler('orchestrator')
@Injectable()
export class OrchestratorHandler implements KafkaEventHandler {
  readonly #logger = getLogger(OrchestratorHandler.name);

  @KafkaEvent(
    KafkaTopics.orchestrator.shutdown,
    KafkaTopics.orchestrator.restart,
    KafkaTopics.orchestrator.start,
    KafkaTopics.orchestrator.all.shutdown,
    KafkaTopics.orchestrator.all.restart,
    KafkaTopics.orchestrator.all.start,
  )
  @Trace('kafka-consume.all.orchestration')
  async handle(topic: string): Promise<void> {
    this.#logger.info(`Orchestrator-Kommando empfangen: ${topic}`);

    switch (topic) {
      case KafkaTopics.orchestrator.all.shutdown:
      case KafkaTopics.orchestrator.shutdown:
        await this.#shutdown();
        break;
      case KafkaTopics.orchestrator.restart:
      case KafkaTopics.orchestrator.all.restart:
        await this.#restart();
        break;
      case KafkaTopics.orchestrator.all.start:
      case KafkaTopics.orchestrator.start:
        this.#logger.info(
          'Startkommando empfangen. Kein weiterer Start notwendig.',
        );
        break;
    }
  }

  async #shutdown(): Promise<void> {
    try {
      this.#logger.warn('→ Shutdown eingeleitet.');
      setTimeout(() => process.exit(0), 100); // Supervisor übernimmt Neustart
    } catch (e) {
      this.#logger.error('Fehler beim Shutdown: ' + (e as Error).message, e);
    }
  }

  async #restart(): Promise<void> {
    this.#logger.warn('→ Restart eingeleitet.');
    setTimeout(() => process.exit(0), 100);
  }
}
