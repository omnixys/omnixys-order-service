
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class KeycloakGuard implements CanActivate {
    #logger = new Logger(KeycloakGuard.name);

    canActivate(context: ExecutionContext): boolean {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req;

        const user = request.user;
        const requiredRoles = this.getRequiredRoles(context);

        if (!user) {
            this.#logger.warn('Kein Benutzer im Request gefunden');
            throw new ForbiddenException('Zugriff verweigert – kein Benutzer gefunden');
        }

        const realmRoles = user.realm_access?.roles ?? [];
        const clientRoles = this.extractClientRoles(user);
        const allRoles = [...realmRoles, ...clientRoles];

        this.#logger.debug(`👤 Benutzer: ${user?.preferred_username}`);
        this.#logger.debug(`📛 Realm-Rollen: ${JSON.stringify(realmRoles)}`);
        this.#logger.debug(`📛 Client-Rollen: ${JSON.stringify(clientRoles)}`);
        this.#logger.debug(`🔒 Erforderliche Rollen: ${JSON.stringify(requiredRoles)}`);

        if (!requiredRoles.length) {
            return true; // keine Rollen gefordert = freier Zugriff
        }

        const hasRole = requiredRoles.some(role => allRoles.includes(role));
        if (!hasRole) {
            throw new ForbiddenException(`Zugriff verweigert – fehlende Rolle(n): ${requiredRoles.join(', ')}`);
        }

        return true;
    }

    private getRequiredRoles(context: ExecutionContext): string[] {
        const handler = context.getHandler();
        const classRef = context.getClass();

        // Nest-Keycloak-Connect speichert Metadaten unter dem Key 'roles'
        const rolesMeta = Reflect.getMetadata('roles', handler) || Reflect.getMetadata('roles', classRef);
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
        return Object.values(resourceAccess)
            .flatMap((entry: any) => entry?.roles ?? []);
    }
}
