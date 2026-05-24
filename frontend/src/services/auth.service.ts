import api from './api'

export const authService = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; token: string; user: { id: number; email: string } }>(
      '/auth/login',
      { email, password }
    ),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => localStorage.removeItem('token'),
}
