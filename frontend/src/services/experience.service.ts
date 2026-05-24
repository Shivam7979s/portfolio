import api from './api'

export interface Experience {
  id: number
  roleTitle: string
  organization: string
  duration: string
  description: string
  technologies: string // Serialized JSON array of strings
  icon?: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export const experienceService = {
  getAll: () => api.get<{ success: boolean; data: Experience[] }>('/experiences'),
  create: (data: Partial<Experience>) => api.post<{ success: boolean; data: Experience }>('/experiences', data),
  update: (id: number, data: Partial<Experience>) => api.put<{ success: boolean; data: Experience }>(`/experiences/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/experiences/${id}`),
  reorder: (orderIds: number[]) => api.post<{ success: boolean; message: string }>('/experiences/reorder', { orderIds }),
}
