import { getLogger } from '../../logger/logger.js';
import { dbType } from '../db.js';
import {
  adminDataSourceOptions,
  dbPopulate,
  dbResourcesDir,
  typeOrmModuleOptions,
  schema,
} from '../typeormOptions.js';
import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';

/**
 * Die Test-DB wird im Development-Modus neu geladen, nachdem die Module
 * initialisiert sind, was durch `OnApplicationBootstrap` realisiert wird.
 *
 * DB-Migration mit TypeORM (ohne Nest): https://typeorm.io/migrations
 */
@Injectable()
export class DbPopulateService implements OnApplicationBootstrap {
  readonly #tabellen = ['orders', 'item'];

  readonly #datasource: DataSource;

  readonly #resourcesDir = dbResourcesDir;

  readonly #logger = getLogger(DbPopulateService.name);

  /**
   * Initialisierung durch DI mit `DataSource` für SQL-Queries.
   */
  constructor(@InjectDataSource() dataSource: DataSource) {
    this.#datasource = dataSource;
  }

  /**
   * Die Test-DB wird im Development-Modus neu geladen.
   */
  async onApplicationBootstrap() {
    await this.populateTestdaten();
  }

  async populateTestdaten() {
    if (!dbPopulate) {
      return;
    }

    this.#logger.warn(`${typeOrmModuleOptions.type}: DB wird neu geladen`);
    switch (dbType) {
      case 'postgres': {
        await this.#populatePostgres();
        break;
      }
      case 'sqlite': {
        await this.#populateSQLite();
        break;
      }
    }
    this.#logger.warn('DB wurde neu geladen');
  }

  async #populatePostgres() {
    const dropScript = resolve(this.#resourcesDir, 'drop.sql');
    this.#logger.debug('dropScript = %s', dropScript);

    const dropStatements = readFileSync(dropScript, 'utf8');
    await this.#datasource.query(dropStatements);

    const createScript = resolve(this.#resourcesDir, 'create.sql');
    this.#logger.debug('createScript = %s', createScript);

    const createStatements = readFileSync(createScript, 'utf8');
    await this.#datasource.query(createStatements);

    // COPY zum Laden von CSV-Dateien erfordert Administrationsrechte
    // https://www.postgresql.org/docs/current/sql-copy.html

    // https://typeorm.io/data-source
    const dataSource = new DataSource(adminDataSourceOptions);
    await dataSource.initialize();
    await dataSource.query(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `SET search_path TO ${schema};`,
    );
    const copyStmt =
      "COPY %TABELLE% FROM '/csv/order/%TABELLE%.csv' (FORMAT csv, DELIMITER ';', HEADER true);";
    for (const tabelle of this.#tabellen) {
      await dataSource.query(copyStmt.replaceAll('%TABELLE%', tabelle));
    }
    await dataSource.destroy();
  }

  async #populateSQLite() {
    const dropScript = resolve(this.#resourcesDir, 'drop.sql');
    // repo.query() kann bei SQLite nur 1 Anweisung mit "raw SQL" ausfuehren
    await this.#executeStatements(dropScript);

    const createScript = resolve(this.#resourcesDir, 'create.sql');
    await this.#executeStatements(createScript);

    const insertScript = resolve(this.#resourcesDir, 'insert.sql');
    await this.#executeStatements(insertScript);
  }

  async #executeStatements(script: string, removeSemi = false) {
    // https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js#answer-17332534
    // alternativ: https://nodejs.org/api/fs.html#fspromisesopenpath-flags-mode
    const statements: string[] = [];
    let statement = '';
    readFileSync(script, 'utf8')
      // bei Zeilenumbruch einen neuen String erstellen
      .split(/\r?\n/u)
      // Kommentarzeilen entfernen
      .filter((line) => !line.includes('--'))
      // Eine Anweisung aus mehreren Zeilen bis zum Semikolon zusammenfuegen
      .forEach((line) => {
        statement += line;
        if (line.endsWith(';')) {
          if (removeSemi) {
            statements.push(statement.slice(0, -1));
          } else {
            statements.push(statement);
          }
          statement = '';
        }
      });

    for (statement of statements) {
      await this.#datasource.query(statement);
    }
  }
}