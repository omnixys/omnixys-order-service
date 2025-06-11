import { Field } from '@nestjs/graphql';
import { UUID } from 'node:crypto';

export class SearchCriteriaInput {
  @Field({ nullable: true })
  customerId?: UUID;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  createdAfter?: Date;

  @Field({ nullable: true })
  createdBefore?: Date;
}
