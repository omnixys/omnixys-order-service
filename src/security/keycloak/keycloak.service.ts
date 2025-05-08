/* eslint-disable camelcase, @typescript-eslint/naming-convention */

import { Injectable } from '@nestjs/common';
import axios, {
    type AxiosInstance,
} from 'axios';
import {
    type KeycloakConnectOptions,
    type KeycloakConnectOptionsFactory,
} from 'nest-keycloak-connect';
import { keycloakConnectOptions } from '../../config/keycloak.js';
import { getLogger } from '../../logger/logger.js';

const { authServerUrl } = keycloakConnectOptions;

/** Typdefinition für Eingabedaten zu einem Token. */
export type TokenData = {
    readonly username: string | undefined;
    readonly password: string | undefined;
};

@Injectable()
export class KeycloakService implements KeycloakConnectOptionsFactory {


    readonly #keycloakClient: AxiosInstance;

    readonly #logger = getLogger(KeycloakService.name);

    constructor() {
        this.#keycloakClient = axios.create({
            baseURL: authServerUrl!,
            // ggf. httpsAgent fuer HTTPS bei selbst-signiertem Zertifikat
        });
        this.#logger.debug('keycloakClient=%o', this.#keycloakClient.defaults);
    }

    createKeycloakConnectOptions(): KeycloakConnectOptions {
        return keycloakConnectOptions;
    }

    async getToken(context: any) {
        const rawAuth = context.req?.headers?.authorization;
        const token = typeof rawAuth === 'string' && rawAuth.startsWith('Bearer ')
            ? rawAuth.slice(7)
            : null;

        const [, payloadStr] = (token as string).split('.');
        const payloadDecoded = atob(payloadStr);
        const payload = JSON.parse(payloadDecoded);
        const { exp, realm_access, preferred_username, email } = payload;
        this.#logger.debug('getToken: exp=%s', exp);
        const { roles } = realm_access;
        this.#logger.debug('getToken: roles=%o ', roles)

        return { username: preferred_username, email, roles, token }
    }
}
/* eslint-enable camelcase, @typescript-eslint/naming-convention */
