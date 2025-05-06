import { SetMetadata } from '@nestjs/common';
import { KAFKA_EVENT_METADATA } from '../interface/kafka-event.interface.js';

export const KafkaEvent = (eventName: string): ClassDecorator => {
    return SetMetadata(KAFKA_EVENT_METADATA, eventName);
};


