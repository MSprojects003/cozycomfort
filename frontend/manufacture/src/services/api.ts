import axios, {type AxiosInstance, type AxiosResponse } from 'axios';

const API_BASE = 'http://localhost:5000/api';

class ManufacturerAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('manufacturer_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Blanket Management
  async getBlankets(): Promise<AxiosResponse> {
    return this.api.get('/manufacturer/blankets');
  }

  async getBlanket(id: number): Promise<AxiosResponse> {
    return this.api.get(`/manufacturer/blankets/${id}`);
  }

  async createBlanket(data: FormData): Promise<AxiosResponse> {
    return this.api.post('/manufacturer/blankets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updateBlanket(id: number, data: any): Promise<AxiosResponse> {
    return this.api.put(`/manufacturer/blankets/${id}`, data);
  }

  async updateBlanketWithImages(id: number, formData: FormData): Promise<AxiosResponse> {
    return this.api.put(`/manufacturer/blankets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updateQuantity(id: number, quantity: number): Promise<AxiosResponse> {
    return this.api.patch(`/manufacturer/blankets/${id}/quantity`, { quantity });
  }

  async deleteBlanket(id: number): Promise<AxiosResponse> {
    return this.api.delete(`/manufacturer/blankets/${id}`);
  }

  async getLowStock(threshold: number = 20): Promise<AxiosResponse> {
    return this.api.get(`/manufacturer/low-stock?threshold=${threshold}`);
  }

  // ============ DISTRIBUTOR ORDERS (Requests from distributors) ============
  
  async getDistributorOrders(): Promise<AxiosResponse> {
    return this.api.get('/manufacturer/orders');
  }

  async getOrderByNumber(orderNumber: string): Promise<AxiosResponse> {
    return this.api.get(`/manufacturer/order/${orderNumber}`);
  }

  async updateOrderStatus(orderNumber: string, status: string): Promise<AxiosResponse> {
    return this.api.put(`/manufacturer/order/${orderNumber}/status`, { status });
  }

  async acceptOrder(orderNumber: string): Promise<AxiosResponse> {
    return this.api.post(`/manufacturer/order/${orderNumber}/accept`);
  }

  async rejectOrder(orderNumber: string, reason?: string): Promise<AxiosResponse> {
    return this.api.post(`/manufacturer/order/${orderNumber}/reject`, { reason });
  }

  // Order Analytics
  async getOrderStats(): Promise<AxiosResponse> {
    return this.api.get('/manufacturer/orders/stats');
  }

  async getOrderHistory(params?: { start_date?: string; end_date?: string }): Promise<AxiosResponse> {
    const queryParams = new URLSearchParams(params).toString();
    return this.api.get(`/manufacturer/orders/history${queryParams ? `?${queryParams}` : ''}`);
  }
}

export const manufacturerAPI = new ManufacturerAPI();
export default manufacturerAPI;