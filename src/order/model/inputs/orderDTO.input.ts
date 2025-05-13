import {
    IsArray,
    IsUUID,
    ValidateNested,
    ArrayMinSize, IsInt, Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemDTO } from './itemDTO.input.js';
import { OrderStatus } from '../entities/order.entity.js';
import { UUID } from 'crypto';


export class OrderDTO {
    
    readonly customerId!: UUID;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => ItemDTO)
    readonly items!: ItemDTO[];
}


export class OrderUpdateDTO {
    @IsUUID()
    readonly id!: UUID;

    @IsInt()
    @Min(0)
    readonly version!: number;

    readonly customerId!: UUID;

    readonly status!: OrderStatus
}