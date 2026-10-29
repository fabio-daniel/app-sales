export interface SaleDetail {
  product: string;
  image: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  subtotal_with_discount: number;
}

export interface SaleUser {
  id: number;
  name: string;
  email: string;
}

export interface Sale {
  id: number;
  total: number;
  total_discount: number;
  created_at: string;
  created_at_datetime: string;
  user: SaleUser | null;
  units: number;
  details: SaleDetail[];
}

export interface SaleItemRequest {
  product_id: number;
  quantity: number;
  discount_percent: number;
}

export interface CreateSaleRequest {
  user_id: number;
  items: SaleItemRequest[];
}

export interface CreateSaleResponse {
  message: string;
  sale_id: number;
  total: number;
}

export interface MessageResponse {
  message: string;
}
