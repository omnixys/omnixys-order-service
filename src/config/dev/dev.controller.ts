import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { DbPopulateService } from './db-populate.service.js';
import {
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard, Roles } from 'nest-keycloak-connect';

/**
 * Die Controller-Klasse für die Entwicklung, z.B. Neuladen der DB.
 */
@Controller('admin')
@UseGuards(AuthGuard)
@Roles({ roles: ['Admin'] })
@UseInterceptors(ResponseTimeInterceptor)
export class DevController {
  readonly #service: DbPopulateService;

  constructor(service: DbPopulateService) {
    this.#service = service;
  }

  @Post('db_populate')
  async dbPopulate(@Res() res: Response): Promise<Response> {
    await this.#service.populateTestdaten();
    const success = {
      // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase
      db_populate: 'success',
    };
    return res.status(HttpStatus.OK).json(success);
  }
}
