export interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  registration_date: string;
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

export interface OrderItem {
  blanket_id: number;
  quantity: number;
}

export interface PlaceOrderData {
  distributor_id: number;
  items: OrderItem[];
  notes: string;
}

export interface DistributorOrder {
  id: number;
  order_number: string;
  distributor_id: number;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  order_date: string;
  shipped_date: string | null;
  delivered_date: string | null;
  notes: string;
}

export interface SellerOrder {
  id: number;
  order_number: string;
  seller_id: number;
  seller_name?: string;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  order_date: string;
  expected_delivery?: string;
  delivered_date?: string | null;
  notes: string;
  payment_status: 'Pending' | 'Paid' | 'Partial';
}

export interface DistributorInventory {
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  reorder_level: number;
  last_updated: string;
}

export interface ManufacturerRequest {
  id: number;
  request_number: string;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Received' | 'Rejected';
  request_date: string;
  expected_date?: string;
  received_date?: string;
  notes: string;
}

export interface OrderSummary {
  total_orders: number;
  total_items_ordered: number;
  total_amount_spent: number;
  status_breakdown: {
    Pending: number;
    Confirmed: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}