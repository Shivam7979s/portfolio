/* =========================================
   API SERVICE
   Production Ready Base URL Setup
========================================= */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Railway Production Backend URL
    this.baseUrl =
      (import.meta.env.VITE_API_URL as string) ||
      'https://portfolio-production-5efc.up.railway.app/api';

    // Request timeout
    this.timeout = 10000;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    const url = `${this.baseUrl}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        data,
        status: response.status,
        ok: response.ok,
      };
    } catch (error) {
      console.error('❌ API Request Error:', error);

      return {
        data: null as any,
        status: 0,
        ok: false,
      };
    }
  }

  // =========================
  // GET
  // =========================
  get<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'GET',
    });
  }

  // =========================
  // POST
  // =========================
  post<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  // =========================
  // PUT
  // =========================
  put<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  // =========================
  // DELETE
  // =========================
  delete<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'DELETE',
    });
  }
}

// Singleton Export
export const apiService = new ApiService();