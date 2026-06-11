export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  registration_date: string;
}

export interface Product {
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

export interface CartItem {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface CustomerOrder {
  id: number;
  order_number: string;
  customer_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  order_date: string;
  shipping_address: string;
  payment_method: string;
  payment_status: 'Pending' | 'Paid';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}