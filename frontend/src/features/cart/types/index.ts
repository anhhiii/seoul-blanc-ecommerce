export interface CartItem {
  productVariantId: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    size: 'S' | 'M' | 'L' | 'XL';
    color: string;
    stock: number;
    sku: string;
    product: {
      id: string;
      name: string;
      slug: string;
      thumbnail: string;
      price: number;
      discountPrice: number | null;
    } | null;
  } | null;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    cart: Cart;
  };
}
