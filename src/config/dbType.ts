import { config } from "./order";

const dbConfig = config.db;

type DbType = 'postgres' | 'mysql' | 'sqlite';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const type: DbType | undefined = dbConfig?.type;

export const dbType =
  type === 'postgres' || type === 'mysql' || type === 'sqlite'
    ? type
    : 'postgres';
