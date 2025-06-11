import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { KafkaIndicator } from './kafka.indicator.js';
import { Public } from '../security/keycloak/decorators/public.decorator.js';

@Controller('health')
export class HealthController {
  readonly #health: HealthCheckService;
  readonly #typeorm: TypeOrmHealthIndicator;
  readonly #http: HttpHealthIndicator;
  readonly #kafka: KafkaIndicator;

  constructor(
    health: HealthCheckService,
    typeorm: TypeOrmHealthIndicator,
    http: HttpHealthIndicator,
    kafka: KafkaIndicator,
  ) {
    this.#health = health;
    this.#typeorm = typeorm;
    this.#http = http;
    this.#kafka = kafka;
  }

  @Get('liveness')
  @HealthCheck()
  @Public()
  liveness() {
    return this.#health.check([
      () => Promise.resolve({ app: { status: 'up' } }),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @Public()
  readiness() {
    return this.#health.check([
      () => this.#typeorm.pingCheck('postgres'),
      () => this.#kafka.isHealthy(),
      () => this.#http.pingCheck('tempo', process.env.TEMPO_HEALTH_URL!),
      () =>
        this.#http.pingCheck('prometheus', process.env.PROMETHEUS_HEALTH_URL!),
    ]);
  }
}
