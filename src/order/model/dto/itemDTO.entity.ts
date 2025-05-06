import {
    IsString,
    IsNumber,
    IsPositive,
    IsInt,
    Min,
} from 'class-validator';
import { UUID } from 'crypto';

export class ItemDTO {
    @IsString()
    readonly inventoryId!: UUID;

    @IsNumber()
    @IsPositive()
    readonly price!: number;

    @IsInt()
    @Min(1)
    readonly quantity!: number;
}