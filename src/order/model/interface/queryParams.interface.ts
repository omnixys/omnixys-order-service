import { SearchCriteria } from '../types/searchCriteria.type';
import { Order } from '../entities/order.entity';
import { Pageable } from '../../utils/pageable';
import { UUID } from 'crypto';

export interface FindByIdParams {
  readonly id: UUID;
  /** Sollen die Varianten mitgeladen werden? */
  readonly withOrderedItem?: boolean;
}

export interface FindParams {
  readonly searchCriteria: SearchCriteria;
  readonly pageable: Pageable;
}

/** Typdefinitionen zum Aktualisieren eines Productes mit `update`. */
export type UpdateParams = {
  /** ID des zu aktualisierenden Productes. */
  readonly id: UUID | undefined;
  /** Product-Objekt mit den aktualisierten Werten. */
  readonly order: Order;
  /** Versionsnummer für die aktualisierenden Werte. */
  readonly version: string;
};
