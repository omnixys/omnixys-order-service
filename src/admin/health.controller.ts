/**
 * Das Modul besteht aus der Controller-Klasse für Health-Checks.
 * @packageDocumentation
 */

import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';

/**
 * Die Controller-Klasse für Health-Checks.
 */
@Controller('health')
export class HealthController {
    readonly #health: HealthCheckService;

    readonly #typeorm: TypeOrmHealthIndicator;

    constructor(health: HealthCheckService, typeorm: TypeOrmHealthIndicator) {
        this.#health = health;
        this.#typeorm = typeorm;
    }

    @Get('liveness')
    @HealthCheck()
    live() {
        return this.#health.check([
            () => ({
                appserver: {
                    status: 'up',
                },
            }),
        ]);
    }

    @Get('readiness')
    @HealthCheck()
    ready() {
        return this.#health.check([() => this.#typeorm.pingCheck('db')]);
    }
}
