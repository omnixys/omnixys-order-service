/**
 * @constant GRAPHQL_SCHEMA
 *
 * @description
 * Eine Umgebungsvariable, die bestimmt, wie das GraphQL-Schema geladen wird.
 *
 * - `true`: Aktiviert die Verwendung mehrerer GraphQL-Schemas.
 * - `false` (Standard): Verwendet ein einzelnes zentrales Schema.
 *
 * @default
 * `false`
 *
 * @example
 * ```env
 * GRAPHQL_SCHEMA=true  // Nutzt mehrere GraphQL-Schemas.
 * GRAPHQL_SCHEMA=false // Nutzt ein einziges GraphQL-Schema.
 * ```
 */
import { ApolloDriver, ApolloFederationDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import path from 'node:path';
import { RESOURCES_DIR } from './app.js';
import { env } from './env.js';
const { GRAPHQL_SCHEMA } = env;

let schemaGraphQL;

if (GRAPHQL_SCHEMA === 'true') {
    /**
     * Pfade zu den GraphQL-Schema-Dateien, modularisiert nach Verantwortlichkeiten.
     */
    schemaGraphQL = [
        path.join(RESOURCES_DIR, 'graphql', 'order', 'order.input.graphql'),
        path.join(RESOURCES_DIR, 'graphql', 'order', 'order.type.graphql'),
        path.join(RESOURCES_DIR, 'graphql', 'order', 'order.schema.graphql'),
    ];

    // Debug-Ausgabe zur Überprüfung der geladenen Pfade
    console.debug('GraphQL-Schemas = %s', schemaGraphQL);
} else {
    schemaGraphQL = [path.join(RESOURCES_DIR, 'graphql', 'order.schema.graphql')];

    console.debug('schemaGraphQL = %s', schemaGraphQL);
}

/**
 * Das Konfigurationsobjekt für GraphQL (siehe src\app.module.ts).
 */
export const graphQlModuleOptions: ApolloDriverConfig = {
    /**
     * `typePaths` definiert die Pfade zu den GraphQL-Schema-Dateien.
     * Diese können modularisiert und in separaten Dateien organisiert werden.
     */
    typePaths: schemaGraphQL,

    /**
     * Alternativer GraphQL-Treiber:
     * Für bessere Performance könnte Mercurius verwendet werden, der auf Fastify basiert.
     */
    driver: ApolloDriver,
    csrfPrevention: process.env.NODE_ENV === 'production',
    

    /**
     * Deaktiviert das Playground-Tool in der Produktionsumgebung.
     * Zum Testen kann es durch `playground: true` aktiviert werden.
     */
    playground: false,

    /**
     * Aktiviert den Playground und Debug-Modus basierend auf der Umgebung.
     */
    // playground: process.env.NODE_ENV !== 'orderion',
    // debug: process.env.NODE_ENV !== 'orderion',
};

export const graphQlModuleOptions2: ApolloDriverConfig = {
    typePaths: schemaGraphQL,
    driver: ApolloFederationDriver,
    playground: false,
};
