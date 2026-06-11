import axios, {type AxiosInstance,type AxiosResponse } from 'axios';

const API_BASE = 'http://localhost:5000/api';

class DistributorAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('distributor_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ============ AUTH & REGISTRATION ============
  
  async register(data: { name: string; email: string; phone: string; address: string }): Promise<AxiosResponse> {
    return this.api.post('/distributor/register', data);
  }

  async login(email: string, password: string): Promise<AxiosResponse> {
    const response = await this.api.get('/distributors');
    const distributors = response.data.distributors || [];
    const distributor = distributors.find((d: any) => d.email === email);
    if (distributor) {
      localStorage.setItem('distributor_token', 'mock-token');
      localStorage.setItem('distributor', JSON.stringify(distributor));
      localStorage.setItem('distributor_id', distributor.id.toString());
      return { data: { distributor } } as AxiosResponse;
    }
    throw new Error('Distributor not found');
  }

  async getDistributor(id: number): Promise<AxiosResponse> {
    return this.api.get(`/distributor/${id}`);
  }

  async getAllDistributors(): Promise<AxiosResponse> {
    return this.api.get('/distributors');
  }

  // ============ PRODUCTS ============
  
  async getAvailableBlankets(): Promise<AxiosResponse> {
    return this.api.get('/distributor/available-blankets');
  }

  // ============ INVENTORY ============
  
  async getInventory(distributorId: number): Promise<AxiosResponse> {
    return this.api.get(`/distributor/inventory?distributor_id=${distributorId}`);
  }

  // ============ ORDERS TO MANUFACTURER ============
  
  async placeOrder(data: { distributor_id: number; items: { blanket_id: number; quantity: number }[]; notes: string }): Promise<AxiosResponse> {
    return this.api.post('/distributor/place-order', data);
  }

  // FIXED: This method gets distributor's requests to manufacturer
  async getMyRequests(distributorId: number, status?: string): Promise<AxiosResponse> {
    const url = status ? `/distributor/${distributorId}/orders?status=${status}` : `/distributor/${distributorId}/orders`;
    console.log('Fetching requests from:', url);
    return this.api.get(url);
  }

  // Alias for compatibility
  async getOrders(distributorId: number, status?: string): Promise<AxiosResponse> {
    return this.getMyRequests(distributorId, status);
  }

  async updateOrderStatus(orderNumber: string, status: string): Promise<AxiosResponse> {
    return this.api.put(`/distributor/order/${orderNumber}/status`, { status });
  }

  // ============ SELLER ORDERS (Broadcast) ============
  
  async getPendingSellerOrders(distributorId: number): Promise<AxiosResponse> {
    return this.api.get(`/distributor/pending-orders?distributor_id=${distributorId}`);
  }

  async acceptSellerOrder(orderNumber: string, distributorId: number): Promise<AxiosResponse> {
    return this.api.post(`/distributor/accept-order/${orderNumber}`, { distributor_id: distributorId });
  }

  async getMyAcceptedOrders(distributorId: number): Promise<AxiosResponse> {
    return this.api.get(`/distributor/my-accepted-orders?distributor_id=${distributorId}`);
  }

  async fulfillOrder(orderNumber: string, distributorId: number, status: string): Promise<AxiosResponse> {
    return this.api.put(`/distributor/fulfill-order/${orderNumber}`, { 
      distributor_id: distributorId, 
      status 
    });
  }

  // ============ REQUEST FROM MANUFACTURER ============
  
  async requestFromManufacturer(blanketId: number, quantity: number, notes?: string): Promise<AxiosResponse> {
    const distributorId = parseInt(localStorage.getItem('distributor_id') || '0');
    console.log('Sending request:', { distributor_id: distributorId, items: [{ blanket_id: blanketId, quantity }], notes });
    return this.placeOrder({
      distributor_id: distributorId,
      items: [{ blanket_id: blanketId, quantity }],
      notes: notes || ''
    });
  }

  // ============ STATISTICS ============
  
  async getOrderStats(distributorId: number): Promise<AxiosResponse> {
    return this.api.get(`/distributor/order-stats?distributor_id=${distributorId}`);
  }

  async getSummary(distributorId: number): Promise<AxiosResponse> {
    return this.api.get(`/distributor/${distributorId}/summary`);
  }
}

export const distributorAPI = new DistributorAPI();
export default distributorAPI;