
// eslint-disable-next-line max-classes-per-file
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
    AuthGuard,
    KeycloakConnectModule,
   // RoleGuard,
} from 'nest-keycloak-connect';
import { KeycloakService } from './keycloak.service.js';
import { KeycloakGuard } from './guards/keycloak.guard.js';

@Module({
    providers: [KeycloakService],
    exports: [KeycloakService],
})
class ConfigModule {}

@Module({
    imports: [
        KeycloakConnectModule.registerAsync({
            useExisting: KeycloakService,
            imports: [ConfigModule],
        }),
    ],
    providers: [
        KeycloakService,
        {
            // fuer @UseGuards(AuthGuard)
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            // fuer @Roles({ roles: ['admin'] }) einschl. @Public() und @AllowAnyRole()
            provide: APP_GUARD,
            // useClass: RoleGuard,
            useClass: KeycloakGuard,
        },
    ],
    exports: [KeycloakConnectModule, KeycloakService],
})
export class KeycloakModule {}
