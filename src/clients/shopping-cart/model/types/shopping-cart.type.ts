export interface ShoppingCartItem {
  productId: string;
  quantity: number;
}

export interface ShoppingCart {
  id: string;
  userId: string;
  items: ShoppingCartItem[];
}
