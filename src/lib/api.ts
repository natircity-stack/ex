const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        this.logout();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{token: string, user: any}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Weekly data methods
  async getWeeklyData() {
    return this.request<any[]>('/weekly-data');
  }

  async createWeeklyData(data: any) {
    return this.request<any>('/weekly-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWeeklyData(id: string, data: any) {
    return this.request<any>(`/weekly-data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWeeklyData(id: string) {
    return this.request<void>(`/weekly-data/${id}`, {
      method: 'DELETE',
    });
  }

  // Bonuses methods
  async getBonuses() {
    return this.request<any[]>('/bonuses');
  }

  async createBonus(data: any) {
    return this.request<any>('/bonuses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBonus(id: string, data: any) {
    return this.request<any>(`/bonuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBonus(id: string) {
    return this.request<void>(`/bonuses/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();