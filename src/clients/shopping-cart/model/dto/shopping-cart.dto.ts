import { UUID } from 'crypto';

export class ShoppingCartItemDto {
  productId: UUID;
  quantity: number;
}

export class ShoppingCartDto {
  id: UUID;
  userId: string;
  items: ShoppingCartItemDto[];
}
