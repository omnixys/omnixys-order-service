import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusController } from './prometheus.controller.js';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [PrometheusController],
})
export class AdminModule {}
