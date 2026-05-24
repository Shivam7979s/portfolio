import api from './api'

export interface AboutData {
  id: number
  title: string
  description: string
  statsCards: string // Serialized JSON array of {label, value, icon}
  highlights: string // Serialized JSON array of strings
  personalBio: string
  profileImage?: string
  updatedAt?: string
}

export const aboutService = {
  get: () => api.get<{ success: boolean; data: AboutData }>('/about'),
  update: (data: Partial<AboutData>) => api.put<{ success: boolean; data: AboutData }>('/about', data),
}
