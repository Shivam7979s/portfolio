import api from './api'

export interface ActivityItem {
  type: 'project' | 'skill' | 'message'
  title: string
  time: string
  detail: string
}

export interface DashboardStats {
  totalProjects: number
  totalSkills: number
  totalMessages: number
  unreadMessages: number
  resume: {
    fileUrl: string
    version?: string
    uploadedAt: string
  } | null
  recentActivity: ActivityItem[]
}

export const dashboardService = {
  getStats: () => api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),
}
