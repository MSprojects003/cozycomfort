export interface Seller {
  id: number;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  store_type: 'physical' | 'online' | 'both';
  website: string;
  registration_date: string;
  is_active: boolean;
}

export interface Blanket {
  id: number;
  name: string;
  quantity: number;
  material: string;
  size: string;
  color: string;
  price: number;
  front_image: string | null;
  back_image: string | null;
}

export interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface SellerOrder {
  id: number;
  order_number: string;
  seller_id: number;
  distributor_id: number;
  distributor_name?: string;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total_cost: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  order_date: string;
  expected_delivery?: string;
  delivered_date?: string | null;
  payment_status: 'Pending' | 'Paid' | 'Partial';
  notes: string;
}

export interface SellerInventory {
  id: number;
  seller_id: number;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  purchased_price: number;
  selling_price: number;
  last_updated: string;
}

export interface DashboardSummary {
  total_orders_placed: number;
  pending_orders: number;
  accepted_orders: number;
  fulfilled_orders: number;
  total_amount_spent: number;
  total_inventory_value: number;
  total_items_in_stock: number;
}

export interface PlaceOrderData {
  seller_id: number;
  distributor_id: number;
  items: {
    blanket_id: number;
    quantity: number;
    selling_price: number;
  }[];
  notes: string;
}

export interface RegisterData {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  store_type: string;
  website: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}