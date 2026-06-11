import axios, { type AxiosInstance,type AxiosResponse } from 'axios';
import type{ Product, Customer, CustomerOrder, CartItem, RegisterData } from '../types';

const API_BASE = 'http://localhost:5000/api';

class CustomerAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('customer_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth
  async register(data: RegisterData): Promise<AxiosResponse<{ message: string; customer: Customer }>> {
    return this.api.post('/customer/register', data);
  }

  async login(email: string): Promise<AxiosResponse<{ customer: Customer }>> {
    const response = await this.api.post('/customer/login', { email });
    return response;
  }

  async getCustomer(id: number): Promise<AxiosResponse<{ customer: Customer }>> {
    return this.api.get(`/customer/${id}`);
  }

  // Products
  async getProducts(params?: any): Promise<AxiosResponse<{ products: Product[]; count: number }>> {
    const queryParams = new URLSearchParams(params).toString();
    return this.api.get(`/customer/products${queryParams ? `?${queryParams}` : ''}`);
  }

  async getProduct(id: number): Promise<AxiosResponse<{ product: Product }>> {
    return this.api.get(`/customer/product/${id}`);
  }

  async getFilters(): Promise<AxiosResponse> {
    return this.api.get('/customer/filters');
  }

  // Orders - seller_id is optional, backend will use default seller
  async checkout(data: { 
    customer_id: number; 
    items: CartItem[];
    payment_method: string;
    shipping_address: string;
    notes?: string;
  }): Promise<AxiosResponse<{ message: string; order_number: string; total_amount: number }>> {
    return this.api.post(`/customer/${data.customer_id}/checkout`, {
      items: data.items.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
      payment_method: data.payment_method,
      shipping_address: data.shipping_address,
      notes: data.notes
    });
  }

  async getOrders(customerId: number): Promise<AxiosResponse<{ orders: CustomerOrder[]; total_orders: number }>> {
    return this.api.get(`/customer/${customerId}/orders`);
  }

  async getOrderDetails(orderNumber: string): Promise<AxiosResponse<{ order: CustomerOrder }>> {
    return this.api.get(`/customer/order/${orderNumber}`);
  }

  // Dashboard
  async getDashboard(customerId: number): Promise<AxiosResponse> {
    return this.api.get(`/customer/${customerId}/dashboard`);
  }
}

export const customerAPI = new CustomerAPI();
export default customerAPI;