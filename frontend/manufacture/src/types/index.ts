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
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'manufacturer' | 'distributor' | 'seller' | 'customer';
  company?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface BlanketFormData {
  name: string;
  quantity: number;
  material: string;
  size: string;
  color: string;
  price: number;
  front_image?: File | null;
  back_image?: File | null;
}

export interface ImagePreview {
  front: string | null;
  back: string | null;
}

// ... existing types ...

export interface DistributorOrder {
  id: number;
  order_number: string;
  distributor_id: number;
  distributor_name?: string;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  order_date: string;
  shipped_date: string | null;
  delivered_date: string | null;
  notes: string;
}

export interface OrderStatusUpdate {
  order_number: string;
  status: string;
}

export interface ProductionSchedule {
  id: number;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  scheduled_date: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  total_items_sold: number;
}