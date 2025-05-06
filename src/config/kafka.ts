import { config } from "./order.js";

const { kafka } = config;

export const kafkaBroker = `${kafka.host}:9092`;
export const groupId = kafka.groupId
console.log('kafka Host is %s', kafkaBroker);
