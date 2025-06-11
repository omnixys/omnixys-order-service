import dotenv from 'dotenv';
import process from 'node:process';

// TODO: node --env-file .env
dotenv.config();

const {
  NODE_ENV,
  CLIENT_SECRET,
  LOG_DEFAULT,
  START_DB_SERVER,
  GRAPHQL_SCHEMA,
  KEYS_PATH,
  HTTPS,
  TEMPO_URI,
} = process.env;

export const env = {
  NODE_ENV,
  CLIENT_SECRET,
  LOG_DEFAULT,
  START_DB_SERVER,
  GRAPHQL_SCHEMA,
  KEYS_PATH,
  HTTPS,
  TEMPO_URI,
} as const;

console.debug('NODE_ENV = %s', NODE_ENV);
console.debug('NODE_ENV = %s', LOG_DEFAULT);
