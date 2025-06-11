import { Field } from '@nestjs/graphql';

export class PageInput {
  @Field({ nullable: true })
  number?: string;

  @Field({ nullable: true })
  size?: string;
}
