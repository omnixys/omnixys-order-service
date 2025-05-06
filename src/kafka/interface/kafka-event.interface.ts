export interface KafkaEventContext {
    topic: string;
    partition: number;
    offset: string;
    headers: Record<string, string | undefined>;
    timestamp: string;
}

export interface KafkaEventHandler {
    handle(data: unknown, context: KafkaEventContext): Promise<void>;
}

export const KAFKA_EVENT_METADATA = 'KAFKA_EVENT_METADATA';
