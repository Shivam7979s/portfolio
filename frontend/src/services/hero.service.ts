import api from './api'

export interface HeroData {
  id: number
  name: string
  title: string
  subtitle: string
  description: string
  buttons: string // Serialized JSON array
  socialLinks: string // Serialized JSON array
  bgImage?: string
  bgVideo?: string
  profileImage?: string
  settings3D?: string // Serialized JSON object
  updatedAt?: string
}

export const heroService = {
  get: () => api.get<{ success: boolean; data: HeroData }>('/hero'),
  update: (data: Partial<HeroData>) => api.put<{ success: boolean; data: HeroData }>('/hero', data),
}
