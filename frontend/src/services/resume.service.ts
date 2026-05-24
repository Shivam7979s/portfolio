import api from './api'

export interface Resume {
  id: number
  fileUrl: string
  version?: string
  isActive: boolean
  uploadedAt: string
}

export const resumeService = {
  getAll: () => api.get<{ success: boolean; data: Resume[] }>('/resumes'),
  getActive: () => api.get<{ success: boolean; data: Resume | null }>('/resumes/active'),
  create: (data: { fileUrl: string; version?: string }) => api.post<{ success: boolean; data: Resume }>('/resumes', data),
  setActive: (id: number) => api.put<{ success: boolean; message: string }>(`/resumes/${id}/active`, {}),
  delete: (id: number) => api.delete<{ success: boolean; message: string }>(`/resumes/${id}`),
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
