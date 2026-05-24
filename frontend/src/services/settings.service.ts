import api from './api'

export interface SettingsData {
  id: number
  themeColors: string // Serialized JSON object of theme colors
  logoText?: string
  logoImage?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  favicon?: string
  openGraphImage?: string
  customCursor: boolean
  particleEffects: boolean
  
  // Contact details
  contactEmail?: string
  contactPhone?: string
  contactLocation?: string
  contactCTA?: string
  
  updatedAt?: string
}

export const settingsService = {
  get: () => api.get<{ success: boolean; data: SettingsData }>('/settings'),
  update: (data: Partial<SettingsData>) => api.put<{ success: boolean; data: SettingsData }>('/settings', data),
}
