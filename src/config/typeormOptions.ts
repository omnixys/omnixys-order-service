import { loggerDefaultValue } from './logger.js';
import { nodeConfig } from './node.js';
import { resolve } from 'node:path';
import { type DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './typeormNamingStrategy.js';
import { dbType } from './db.js';
import { config } from './order.js';
import { entities } from '../order/model/entities/entities.js';
import { Order } from '../order/model/entities/order.entity.js';

const { db } = config;

// nullish coalescing
export const database =
  (db?.database as string | undefined) ?? Order.name.toLowerCase();

const host = db?.host as string | undefined;
const username =
  (db?.username as string | undefined) ?? Order.name.toLowerCase();
const pass = db?.password as string | undefined;
const passAdmin = db?.passwordAdmin as string | undefined;
export const schema = db?.schema as string | undefined;
const adminUsername = db?.adminUsername as string

const namingStrategy = new SnakeNamingStrategy();

const logging =
  (nodeConfig.nodeEnv === 'development' || nodeConfig.nodeEnv === 'test') &&
  !loggerDefaultValue;
const logger = 'advanced-console';

export const dbResourcesDir = resolve(nodeConfig.resourcesDir, 'db', dbType);
console.debug('dbResourcesDir = %s', dbResourcesDir);
console.debug(
  'database=%s, username=%s, password=%s, host=%s, schema=%s',
  database,
  username,
  pass,
  host,
  schema,
);

// TODO records als "deeply immutable data structure" (Stage 2)
// https://github.com/tc39/proposal-record-tuple
let dataSourceOptions: DataSourceOptions;
switch (dbType) {
  case 'postgres': {
    dataSourceOptions = {
      type: 'postgres',
      host,
      port: 5432,
      username,
      password: pass,
      database,
      schema,
      poolSize: 10,
      entities,
      logging,
      logger,
      namingStrategy,
    };
    break;
  }
}
Object.freeze(dataSourceOptions);
export const typeOrmModuleOptions = dataSourceOptions;

export const dbPopulate = db?.populate === true;
let adminDataSourceOptionsTemp: DataSourceOptions | undefined;
if (dbType === 'postgres') {
  adminDataSourceOptionsTemp = {
    type: 'postgres',
    host,
    port: 5432,
    username: adminUsername,
    password: passAdmin,
    database,
    schema,
    namingStrategy,
    logging,
    logger,
    // extra: {
    //   ssl: {
    //     rejectUnauthorized: false,
    //   },
    // },
  };
}
export const adminDataSourceOptions = adminDataSourceOptionsTemp;
