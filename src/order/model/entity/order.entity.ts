import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { Item } from './item.entity.js';
import { DecimalTransformer } from '../../utils/decimal-transformer.js';
import { UUID } from 'crypto';
import Decimal from 'decimal.js';

export type OrderStatus = 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'UNPAID';

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: UUID | undefined;

    @VersionColumn()
    version: number;

    @Column({ unique: true })
    orderNumber: string;

    @Column({
        type: 'enum',
        enum: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'UNPAID'],
        default: 'PROCESSING'
    })
    status: OrderStatus;

    @Column('decimal', {
        precision: 8,
        scale: 2,
        transformer: new DecimalTransformer(),
    })
    totalAmount: Decimal;

    @Column()
    readonly username: string

    @OneToMany(() => Item, (item) => item.order, {
        cascade: ['insert', 'remove'],
    })
    items: Item[];

    @CreateDateColumn({ type: 'timestamp' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated: Date;

    toString(): string {
        return JSON.stringify({
            id: this.id,
            version: this.version,
            orderNumber: this.orderNumber,
            status: this.status,
            totalAmount: this.totalAmount,
            createdAt: this.created,
            updatedAt: this.updated,
        });
    }
}
