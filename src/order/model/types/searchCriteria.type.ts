import { UUID } from 'node:crypto';

export interface SearchCriteria {
  readonly orderNumber?: string;
  readonly status?: string;
  readonly customerId?: UUID;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}
