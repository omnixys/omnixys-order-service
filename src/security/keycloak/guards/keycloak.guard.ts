import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../constants.js';

@Injectable()
export class KeycloakGuard implements CanActivate {
  #logger = new Logger(KeycloakGuard.name);

  readonly #reflector: Reflector;
  constructor(reflector: Reflector) {
    this.#reflector = reflector;
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.#reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.#logger.debug('🔓 Öffentliche Route erkannt – Zugriff erlaubt');
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const isIntrospection =
      request?.headers?.['x-introspection'] === 'true' ||
      request?.body?.operationName === 'IntrospectionQuery';

    if (isIntrospection) {
      this.#logger.debug('🧪 Introspectionsabfrage erkannt – Zugriff erlaubt');
      return true;
    }

    const user = request.user;
    const requiredRoles = this.getRequiredRoles(context);

    if (!requiredRoles.length) {
      return true; // keine Rollen gefordert = freier Zugriff
    }

    if (!user) {
      this.#logger.warn('Kein Benutzer im Request gefunden');
      throw new ForbiddenException(
        'Zugriff verweigert – kein Benutzer gefunden',
      );
    }

    const realmRoles = user.realm_access?.roles ?? [];
    const clientRoles = this.extractClientRoles(user);
    const allRoles = [...realmRoles, ...clientRoles];

    this.#logger.debug(`👤 Benutzer: ${user?.preferred_username}`);
    this.#logger.debug(`📛 Realm-Rollen: ${JSON.stringify(realmRoles)}`);
    this.#logger.debug(`📛 Client-Rollen: ${JSON.stringify(clientRoles)}`);
    this.#logger.debug(
      `🔒 Erforderliche Rollen: ${JSON.stringify(requiredRoles)}`,
    );

    if (!requiredRoles.length) {
      return true; // keine Rollen gefordert = freier Zugriff
    }

    const hasRole = requiredRoles.some((role) => allRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        `Zugriff verweigert – fehlende Rolle(n): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }

  private getRequiredRoles(context: ExecutionContext): string[] {
    const handler = context.getHandler();
    const classRef = context.getClass();

    // Nest-Keycloak-Connect speichert Metadaten unter dem Key 'roles'
    const rolesMeta =
      Reflect.getMetadata('roles', handler) ||
      Reflect.getMetadata('roles', classRef);
    if (!rolesMeta) return [];

    if (Array.isArray(rolesMeta)) {
      return rolesMeta;
    } else if (typeof rolesMeta === 'object' && 'roles' in rolesMeta) {
      return rolesMeta.roles;
    }
    return [];
  }

  private extractClientRoles(user: any): string[] {
    const resourceAccess = user.resource_access || {};
    return Object.values(resourceAccess).flatMap(
      (entry: any) => entry?.roles ?? [],
    );
  }
}
