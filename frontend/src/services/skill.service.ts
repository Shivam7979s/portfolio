import api from './api'

export interface Skill {
  id: number
  name: string
  category: string
  icon?: string
  level: number
  order: number
  createdAt?: string
  updatedAt?: string
}

export const skillService = {
  getAll: () => api.get<{ success: boolean; data: Skill[] }>('/skills'),
  create: (data: Partial<Skill>) => api.post<{ success: boolean; data: Skill }>('/skills', data),
  update: (id: number, data: Partial<Skill>) => api.put<{ success: boolean; data: Skill }>(`/skills/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/skills/${id}`),
  reorder: (orderIds: number[]) => api.post<{ success: boolean; message: string }>('/skills/reorder', { orderIds }),
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ success: boolean; url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
