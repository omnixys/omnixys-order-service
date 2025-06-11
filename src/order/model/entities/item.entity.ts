import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Order } from './order.entity.js';
import { Order as OrderClass } from './order.entity.js';
import { DecimalTransformer } from '../../utils/decimal-transformer.js';
import { UUID } from 'crypto';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: UUID | undefined;

  @Column()
  inventoryId: UUID;

  @Column('decimal', {
    precision: 8,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  price: number;

  @Column()
  quantity: number;

  @ManyToOne(() => OrderClass, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order | undefined;

  toString(): string {
    return JSON.stringify({
      id: this.id,
      inventoryId: this.inventoryId,
      price: this.price,
      quantity: this.quantity,
      orderId: this.order?.id,
    });
  }
}
