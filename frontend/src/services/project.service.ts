import api from './api'

export interface Project {
  id: number
  title: string
  description: string
  image?: string
  screenshots?: string // Serialized JSON array of strings
  githubUrl?: string
  liveUrl?: string
  techStack: string
  featured: boolean
  category: string
  markdownDescription?: string
  order: number
  createdAt: string
  updatedAt?: string
}

export const projectService = {
  getAll: () => api.get<{ success: boolean; data: Project[] }>('/projects'),
  getById: (id: number) => api.get<{ success: boolean; data: Project }>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<{ success: boolean; data: Project }>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put<{ success: boolean; data: Project }>(`/projects/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/projects/${id}`),
  reorder: (orderIds: number[]) => api.post<{ success: boolean; message: string }>('/projects/reorder', { orderIds }),
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
