import {
    IsArray,
    IsUUID,
    ValidateNested,
    ArrayMinSize, IsInt, Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemDTO } from './itemDTO.entity.js';
import { OrderStatus } from '../entity/order.entity.js';
import { UUID } from 'crypto';


export class OrderDTO {
    readonly username!: string;

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

    readonly username!: string;

    readonly status!: OrderStatus
}