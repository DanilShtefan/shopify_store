export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  product_price: string;
  product_stock: number;
}

export interface Wishlist {
  id: number;
  session_id: string;
  items: WishlistItem[];
  items_count: number;
}

export interface AddToWishlistPayload {
  product_id: number;
}
