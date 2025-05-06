import { config } from './app.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const dbConfig = config.db;
console.debug('dbConfig: %o', dbConfig);

type DbType = 'postgres' | 'mysql' | 'sqlite';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const type: DbType | undefined = dbConfig?.type;

// 'better-sqlite3' erfordert node-gyp, wenn das Docker-Image gebaut wird
export const dbType =
    type === 'postgres' || type === 'mysql' || type === 'sqlite'
        ? type
        : 'postgres';
