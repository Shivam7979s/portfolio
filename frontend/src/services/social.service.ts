import api from './api'

export interface SocialLinksData {
  id: number
  github?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  portfolio?: string
  youtube?: string
  leetcode?: string
  codeforces?: string
  updatedAt?: string
}

export const socialService = {
  get: () => api.get<{ success: boolean; data: SocialLinksData }>('/social-links'),
  update: (data: Partial<SocialLinksData>) => api.put<{ success: boolean; data: SocialLinksData }>('/social-links', data),
}
