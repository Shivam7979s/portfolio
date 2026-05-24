/* TODO: Replace with production-ready API client (e.g., axios) */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Base URL from env, fallback to localhost
    this.baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
    // Default timeout in ms
    this.timeout = 10000;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);
    const url = `${this.baseUrl}${path}`;
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      const ok = response.ok;
      const status = response.status;
      const data = (await response.json()) as T;
      return { data, status, ok };
    } catch (error) {
      console.error('API request error:', error);
      return { data: null as any, status: 0, ok: false };
    }
  }

  get<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // Add more HTTP verbs as needed (put, delete, etc.)
}

// Export a singleton for ease of import
export const apiService = new ApiService();
