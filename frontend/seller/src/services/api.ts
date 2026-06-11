import axios, {type AxiosInstance,type AxiosResponse } from 'axios';
import type { 
  Blanket, 
  Distributor, 
  SellerOrder, 
  SellerInventory,
  RegisterData,
  Seller,
  DashboardSummary
} from '../types';

// Add CustomerOrder type
interface CustomerOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  blanket_id: number;
  blanket_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  order_date: string;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  notes: string;
  can_accept?: boolean;
}

const API_BASE = 'http://localhost:5000/api';

class SellerAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('seller_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ============ AUTH & REGISTRATION ============
  
  async register(data: RegisterData): Promise<AxiosResponse<{ message: string; seller: Seller }>> {
    return this.api.post('/seller/register', data);
  }

  async login(email: string, password: string): Promise<AxiosResponse<{ seller: Seller }>> {
    const response = await this.api.get('/sellers');
    const sellers = response.data.sellers || [];
    const seller = sellers.find((s: Seller) => s.email === email);
    if (seller) {
      localStorage.setItem('seller_token', 'authenticated');
      localStorage.setItem('seller', JSON.stringify(seller));
      localStorage.setItem('seller_id', seller.id.toString());
      return { data: { seller } } as AxiosResponse;
    }
    throw new Error('Seller not found');
  }

  async getSeller(id: number): Promise<AxiosResponse<{ seller: Seller }>> {
    return this.api.get(`/seller/${id}`);
  }

  // ============ PRODUCTS & DISTRIBUTORS ============
  
  async getAvailableBlankets(): Promise<AxiosResponse<{ available_blankets: Blanket[]; count: number }>> {
    return this.api.get('/seller/available-blankets');
  }

  async getDistributors(): Promise<AxiosResponse<{ distributors: Distributor[] }>> {
    return this.api.get('/distributors');
  }

  // ============ PLACE ORDERS ============
  
  async placeOrder(data: { 
    seller_id: number; 
    items: { blanket_id: number; quantity: number; selling_price: number }[]; 
    notes?: string 
  }): Promise<AxiosResponse<{ 
    message: string; 
    orders: SellerOrder[]; 
    total_cost: number 
  }>> {
    return this.api.post('/seller/place-order', data);
  }

  // ============ ORDER MANAGEMENT ============
  
  async getOrders(sellerId: number, status?: string): Promise<AxiosResponse<{ 
    orders: SellerOrder[]; 
    total_orders: number 
  }>> {
    const url = status ? `/seller/${sellerId}/orders?status=${status}` : `/seller/${sellerId}/orders`;
    return this.api.get(url);
  }

  async getOrderDetails(orderNumber: string): Promise<AxiosResponse<{ order: SellerOrder }>> {
    return this.api.get(`/seller/order/${orderNumber}`);
  }

  async updateOrderStatus(orderNumber: string, status: string): Promise<AxiosResponse<{ message: string; order: SellerOrder }>> {
    return this.api.put(`/seller/order/${orderNumber}/status`, { status });
  }

  async cancelOrder(orderNumber: string): Promise<AxiosResponse<{ message: string; order: SellerOrder }>> {
    return this.api.post(`/seller/order/${orderNumber}/cancel`);
  }

  // ============ INVENTORY MANAGEMENT ============
  
  async getInventory(sellerId: number): Promise<AxiosResponse<{ 
    inventory: SellerInventory[]; 
    total_items: number 
  }>> {
    return this.api.get(`/seller/${sellerId}/inventory`);
  }

  async sellFromInventory(sellerId: number, blanketId: number, quantity: number): Promise<AxiosResponse<{ 
    message: string; 
    remaining_quantity: number;
    inventory: SellerInventory 
  }>> {
    return this.api.post(`/seller/${sellerId}/inventory/sell`, { blanket_id: blanketId, quantity });
  }

  // ============ DASHBOARD ============
  
  async getDashboard(sellerId: number): Promise<AxiosResponse<{ 
    seller: Seller; 
    summary: DashboardSummary;
    recent_orders: SellerOrder[];
  }>> {
    return this.api.get(`/seller/${sellerId}/dashboard`);
  }

  // ============ CUSTOMER ORDERS MANAGEMENT ============
  
  async getCustomerOrders(status?: string): Promise<AxiosResponse<{ 
    orders: CustomerOrder[]; 
    stats: { total: number; pending: number; confirmed: number; shipped: number; delivered: number; cancelled: number }
  }>> {
    const url = status ? `/seller/customer-orders?status=${status}` : '/seller/customer-orders';
    return this.api.get(url);
  }

  async acceptCustomerOrder(orderNumber: string, sellerId: number): Promise<AxiosResponse<{ message: string; order: CustomerOrder }>> {
    return this.api.post(`/seller/customer-order/accept/${orderNumber}`, { seller_id: sellerId });
  }

  async getCustomerOrderDetails(orderNumber: string): Promise<AxiosResponse<{ order: CustomerOrder }>> {
    return this.api.get(`/seller/customer-order/${orderNumber}`);
  }

  async updateCustomerOrderStatus(orderNumber: string, sellerId: number, status: string): Promise<AxiosResponse<{ message: string; order: CustomerOrder }>> {
    return this.api.put(`/seller/customer-order/status/${orderNumber}`, { seller_id: sellerId, status });
  }
}

export const sellerAPI = new SellerAPI();
export default sellerAPI;