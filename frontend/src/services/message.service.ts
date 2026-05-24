import api from './api'

export interface MessageData {
  id: number
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export const messageService = {
  send: (data: { name: string; email: string; message: string }) =>
    api.post<{ success: boolean; message: string; data: MessageData }>('/messages', data),
  getAll: () => api.get<{ success: boolean; data: MessageData[] }>('/messages'),
  toggleRead: (id: number) => api.put<{ success: boolean; data: MessageData }>(`/messages/${id}/toggle-read`, {}),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/messages/${id}`),
}
