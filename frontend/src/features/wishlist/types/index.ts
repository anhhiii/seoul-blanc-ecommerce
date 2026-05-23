import { Product } from '../../product/types/index.js';

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlist: Product[];
  };
}

export interface ToggleWishlistResponse {
  success: boolean;
  message: string;
  data: {
    added: boolean;
    productIds: string[];
  };
}

export interface WishlistIdsResponse {
  success: boolean;
  message: string;
  data: {
    productIds: string[];
  };
}
