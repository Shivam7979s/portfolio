import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  Code2,
  MessageSquare,
  Trash2,
  Plus,
  Edit2,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Award,
  Settings as SettingsIcon,
  User,
  ArrowUp,
  ArrowDown,
  Upload,
  FileText,
  Share2,
  Check,
  Eye,
  Flame,
} from 'lucide-react'

// Backend API integrations
import { authService } from '../services/auth.service'
import { projectService, type Project } from '../services/project.service'
import { skillService, type Skill } from '../services/skill.service'
import { messageService, type MessageData } from '../services/message.service'
import { dashboardService, type DashboardStats } from '../services/dashboard.service'
import { heroService, type HeroData } from '../services/hero.service'
import { aboutService, type AboutData } from '../services/about.service'
import { experienceService, type Experience } from '../services/experience.service'
import { resumeService, type Resume } from '../services/resume.service'
import { socialService, type SocialLinksData } from '../services/social.service'
import { settingsService, type SettingsData } from '../services/settings.service'

type ToastType = 'success' | 'error' | null

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null })

  // --- Aggregate States for Tab Data ---
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [heroData, setHeroData] = useState<HeroData | null>(null)
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [messages, setMessages] = useState<MessageData[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null)
  const [settings, setSettings] = useState<SettingsData | null>(null)

  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal / Form States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    image: '',
    screenshots: '',
    githubUrl: '',
    liveUrl: '',
    techStack: '',
    featured: false,
    category: 'Web',
    markdownDescription: ''
  })

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false)
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null)
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Languages',
    icon: '',
    level: 80
  })

  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null)
  const [experienceForm, setExperienceForm] = useState({
    roleTitle: '',
    organization: '',
    duration: '',
    description: '',
    technologies: '',
    icon: ''
  })

  // Resume Uploader state
  const [resumeVersion, setResumeVersion] = useState('')
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // Auth checking
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getMe()
        fetchAllData()
      } catch {
        navigate('/admin/login')
      }
    }
    checkAuth()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [
        statsRes,
        heroRes,
        aboutRes,
        projRes,
        skillRes,
        expRes,
        msgRes,
        resumeRes,
        socialRes,
        settingsRes
      ] = await Promise.all([
        dashboardService.getStats(),
        heroService.get(),
        aboutService.get(),
        projectService.getAll(),
        skillService.getAll(),
        experienceService.getAll(),
        messageService.getAll(),
        resumeService.getAll(),
        socialService.get(),
        settingsService.get()
      ])

      setStats(statsRes.data.data)
      setHeroData(heroRes.data.data)
      setAboutData(aboutRes.data.data)
      setProjects(projRes.data.data)
      setSkills(skillRes.data.data)
      setExperiences(expRes.data.data)
      setMessages(msgRes.data.data)
      setResumes(resumeRes.data.data)
      setSocialLinks(socialRes.data.data)
      setSettings(settingsRes.data.data)
    } catch (err) {
      console.error('Error fetching CMS data', err)
      showToast('Error syncing with database API', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: null }), 4000)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/admin/login')
  }

  // File Upload Helper (Modular)
  const handleGenericFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    serviceType: 'project' | 'skill' | 'resume' | 'settings'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    showToast('Uploading file to server...', 'success')
    try {
      let uploadRes
      if (serviceType === 'project') uploadRes = await projectService.upload(file)
      else if (serviceType === 'skill') uploadRes = await skillService.upload(file)
      else if (serviceType === 'resume') uploadRes = await resumeService.upload(file)
      else uploadRes = await projectService.upload(file)

      if (uploadRes.data.success) {
        showToast('Upload successful!', 'success')
        return uploadRes.data.url
      }
    } catch (err) {
      console.error(err)
      showToast('Upload failed', 'error')
    }
    return null
  }

  // --- Theme configuration helpers ---
  const getThemeValue = (key: string, fallback: unknown) => {
    if (!settings || !settings.themeColors) return fallback
    try {
      const parsed = JSON.parse(settings.themeColors)
      return parsed[key] !== undefined ? parsed[key] : fallback
    } catch {
      return fallback
    }
  }

  const updateThemeValue = (key: string, value: unknown) => {
    if (!settings) return
    let current: Record<string, unknown> = {}
    try {
      current = JSON.parse(settings.themeColors || '{}')
    } catch {
      current = {}
    }
    const updated = { ...current, [key]: value }
    setSettings({ ...settings, themeColors: JSON.stringify(updated) })
  }

  // --- Singleton Save Handlers ---

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!heroData) return
    setIsSubmitting(true)
    try {
      await heroService.update(heroData)
      showToast('Hero settings saved successfully!', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to save Hero settings', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveAbout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aboutData) return
    setIsSubmitting(true)
    try {
      await aboutService.update(aboutData)
      showToast('About settings saved successfully!', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to save About settings', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socialLinks) return
    setIsSubmitting(true)
    try {
      await socialService.update(socialLinks)
      showToast('Social links saved successfully!', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to save Social links', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setIsSubmitting(true)
    try {
      await settingsService.update(settings)
      showToast('Global settings saved successfully!', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to save settings', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Collection Form Launchers ---

  const openProjectModal = (project?: Project) => {
    if (project) {
      setEditingProjectId(project.id)
      let parsedTech = project.techStack
      try { parsedTech = JSON.parse(project.techStack).join(', ') } catch { /* ignore */ }
      let parsedScreenshots = ''
      try {
        if (project.screenshots) parsedScreenshots = JSON.parse(project.screenshots).join(', ')
      } catch { /* ignore */ }

      setProjectForm({
        title: project.title,
        description: project.description,
        image: project.image || '',
        screenshots: parsedScreenshots,
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
        techStack: parsedTech,
        featured: project.featured,
        category: project.category || 'Web',
        markdownDescription: project.markdownDescription || ''
      })
    } else {
      setEditingProjectId(null)
      setProjectForm({
        title: '',
        description: '',
        image: '',
        screenshots: '',
        githubUrl: '',
        liveUrl: '',
        techStack: '',
        featured: false,
        category: 'Web',
        markdownDescription: ''
      })
    }
    setIsProjectModalOpen(true)
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const techArray = projectForm.techStack.split(',').map(t => t.trim()).filter(Boolean)
    const screenshotArray = projectForm.screenshots.split(',').map(s => s.trim()).filter(Boolean)

    const payload = {
      ...projectForm,
      techStack: JSON.stringify(techArray),
      screenshots: JSON.stringify(screenshotArray)
    }

    try {
      if (editingProjectId) {
        await projectService.update(editingProjectId, payload)
        showToast('Project updated successfully!', 'success')
      } else {
        await projectService.create(payload)
        showToast('Project created successfully!', 'success')
      }
      setIsProjectModalOpen(false)
      fetchAllData()
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { error?: string } } }
      showToast(anyErr.response?.data?.error || 'Failed to save project', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openSkillModal = (skill?: Skill) => {
    if (skill) {
      setEditingSkillId(skill.id)
      setSkillForm({
        name: skill.name,
        category: skill.category,
        icon: skill.icon || '',
        level: skill.level
      })
    } else {
      setEditingSkillId(null)
      setSkillForm({ name: '', category: 'Languages', icon: '', level: 80 })
    }
    setIsSkillModalOpen(true)
  }

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingSkillId) {
        await skillService.update(editingSkillId, skillForm)
        showToast('Skill updated!', 'success')
      } else {
        await skillService.create(skillForm)
        showToast('Skill created!', 'success')
      }
      setIsSkillModalOpen(false)
      fetchAllData()
    } catch {
      showToast('Failed to save skill', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openExperienceModal = (exp?: Experience) => {
    if (exp) {
      setEditingExperienceId(exp.id)
      let parsedTech = exp.technologies
      try { parsedTech = JSON.parse(exp.technologies).join(', ') } catch { /* ignore */ }

      setExperienceForm({
        roleTitle: exp.roleTitle,
        organization: exp.organization,
        duration: exp.duration,
        description: exp.description,
        technologies: parsedTech,
        icon: exp.icon || ''
      })
    } else {
      setEditingExperienceId(null)
      setExperienceForm({
        roleTitle: '',
        organization: '',
        duration: '',
        description: '',
        technologies: '',
        icon: ''
      })
    }
    setIsExperienceModalOpen(true)
  }

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const techArray = experienceForm.technologies.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      ...experienceForm,
      technologies: JSON.stringify(techArray)
    }

    try {
      if (editingExperienceId) {
        await experienceService.update(editingExperienceId, payload)
        showToast('Experience updated successfully', 'success')
      } else {
        await experienceService.create(payload)
        showToast('Experience created successfully', 'success')
      }
      setIsExperienceModalOpen(false)
      fetchAllData()
    } catch {
      showToast('Failed to save experience details', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Deletion Handlers ---

  const deleteProject = async (id: number) => {
    if (!window.confirm('Delete this project forever?')) return
    try {
      await projectService.delete(id)
      showToast('Project deleted successfully', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to delete project', 'error')
    }
  }

  const deleteSkill = async (id: number) => {
    if (!window.confirm('Delete this skill?')) return
    try {
      await skillService.delete(id)
      showToast('Skill deleted successfully', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to delete skill', 'error')
    }
  }

  const deleteExperience = async (id: number) => {
    if (!window.confirm('Delete this timeline experience?')) return
    try {
      await experienceService.delete(id)
      showToast('Experience deleted', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to delete experience', 'error')
    }
  }

  const deleteMessage = async (id: number) => {
    if (!window.confirm('Delete this message?')) return
    await messageService.delete(id)
    fetchAllData()
  }

  const toggleMessageRead = async (id: number) => {
    try {
      await messageService.toggleRead(id)
      fetchAllData()
    } catch {
      showToast('Failed to change read status', 'error')
    }
  }

  const deleteResume = async (id: number) => {
    if (!window.confirm('Delete this resume version?')) return
    try {
      await resumeService.delete(id)
      showToast('Resume version deleted', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to delete resume', 'error')
    }
  }

  const setResumeActive = async (id: number) => {
    try {
      await resumeService.setActive(id)
      showToast('Active resume version switched!', 'success')
      fetchAllData()
    } catch {
      showToast('Failed to change active resume', 'error')
    }
  }

  // --- Sorting/Reordering Operations ---

  const reorderCollection = async (
    type: 'projects' | 'skills' | 'experiences',
    index: number,
    direction: 'up' | 'down'
  ) => {
    let list: { id: number }[] = []
    if (type === 'projects') list = [...projects]
    else if (type === 'skills') list = [...skills]
    else if (type === 'experiences') list = [...experiences]

    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === list.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = list[index]!
    list[index] = list[targetIndex]!
    list[targetIndex] = temp

    const orderedIds = list.map(item => item.id)

    showToast('Updating sort order...', 'success')
    try {
      if (type === 'projects') await projectService.reorder(orderedIds)
      else if (type === 'skills') await skillService.reorder(orderedIds)
      else if (type === 'experiences') await experienceService.reorder(orderedIds)

      fetchAllData()
    } catch {
      showToast('Failed to save reorder position', 'error')
    }
  }

  // --- Resume PDF Upload ---
  const handlePdfUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.getElementById('resume-file-input') as HTMLInputElement
    const file = fileInput?.files?.[0]
    if (!file) {
      showToast('Please select a PDF file first', 'error')
      return
    }

    setUploadingPdf(true)
    try {
      const uploadRes = await resumeService.upload(file)
      if (uploadRes.data.success) {
        await resumeService.create({
          fileUrl: uploadRes.data.url,
          version: resumeVersion || '1.0'
        })
        showToast('New resume uploaded and set as active!', 'success')
        setResumeVersion('')
        if (fileInput) fileInput.value = ''
        fetchAllData()
      }
    } catch {
      showToast('Resume upload failed', 'error')
    } finally {
      setUploadingPdf(false)
    }
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020208] text-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-500 w-12 h-12 mx-auto mb-4" />
          <p className="font-mono text-sm tracking-widest text-white/50">INITIALIZING CMS ENVIRONMENT...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020208] text-white flex relative overflow-hidden font-sans">

      {/* Toast Layer */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl glass-premium border backdrop-blur-xl shadow-2xl ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span className="font-semibold tracking-wide text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <div className="w-72 glass border-r border-white/5 p-6 flex flex-col z-10 shrink-0 select-none">
        <div className="text-xl font-black font-grotesk tracking-tight text-white flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Flame size={14} className="text-white fill-white/20 animate-pulse" />
          </div>
          CINEMATIC
          <span className="text-purple-400 font-mono text-xs px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 ml-2">
            CMS
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {[
            { id: 'overview', icon: <LayoutDashboard size={16} />, label: 'Overview' },
            { id: 'hero', icon: <Sparkles size={16} />, label: 'Hero Section' },
            { id: 'about', icon: <User size={16} />, label: 'About Section' },
            { id: 'skills', icon: <Code2 size={16} />, label: 'Skills Set' },
            { id: 'projects', icon: <Briefcase size={16} />, label: 'Projects Port' },
            { id: 'experience', icon: <Award size={16} />, label: 'Experiences' },
            {
              id: 'contact',
              icon: <MessageSquare size={16} />,
              label: `Inbox & Contact (${messages.filter(m => !m.isRead).length})`
            },
            { id: 'resume', icon: <FileText size={16} />, label: 'Resume Files' },
            { id: 'socials', icon: <Share2 size={16} />, label: 'Social Profiles' },
            { id: 'settings', icon: <SettingsIcon size={16} />, label: 'Global Setup' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/5 text-white border border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                  : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-6 font-semibold text-sm border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} /> Close Terminal
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 p-10 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto pb-20">

          {/* ==================== 1. OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">CMS Overview</h1>
                <p className="text-white/40 text-sm">Real-time state and database analytics for Shivam's portfolio.</p>
              </div>

              {/* Stats Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Total Projects', value: stats.totalProjects, sub: 'Live in Portfolio', color: 'from-purple-500 to-indigo-500' },
                  { title: 'Total Skills', value: stats.totalSkills, sub: 'Across categories', color: 'from-cyan-500 to-teal-500' },
                  {
                    title: 'Unread Messages',
                    value: stats.unreadMessages,
                    sub: `${stats.totalMessages} total received`,
                    color: stats.unreadMessages > 0 ? 'from-pink-500 to-rose-500' : 'from-gray-700 to-gray-800'
                  },
                  { title: 'Active Resume', value: stats.resume?.version || 'N/A', sub: 'PDF download link', color: 'from-amber-500 to-orange-500' },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="glass-premium p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-40"
                  >
                    <div
                      className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 blur-xl pointer-events-none"
                      style={{ backgroundImage: `linear-gradient(${s.color})` }}
                    />
                    <span className="text-white/40 font-mono text-xs tracking-wider uppercase">{s.title}</span>
                    <h2 className="text-4xl font-extrabold font-grotesk tracking-tight text-white my-2">{s.value}</h2>
                    <span className="text-[11px] text-white/50">{s.sub}</span>
                  </div>
                ))}
              </div>

              {/* Traffic & Request Analytics Line Chart */}
              <div className="glass-premium p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-grotesk text-white">System Traffic & API Operations</h3>
                    <span className="text-xs text-white/40 block mt-0.5">
                      Real-time metrics tracking frontend hits, ORB interaction events, and dynamic form submissions.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold tracking-widest uppercase">
                    SYNC_ACTIVE
                  </span>
                </div>

                {/* SVG Line/Area Graph */}
                <div className="h-64 relative bg-black/20 rounded-2xl border border-white/5 p-4 flex items-center justify-center">
                  <svg viewBox="0 0 700 200" className="w-full h-full select-none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Horizontal Guides */}
                    <line x1="45" y1="30" x2="660" y2="30" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                    <line x1="45" y1="75" x2="660" y2="75" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                    <line x1="45" y1="120" x2="660" y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                    <line x1="45" y1="160" x2="660" y2="160" stroke="rgba(255,255,255,0.08)" />

                    {/* Y Axis Labels */}
                    <text x="15" y="34" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">150</text>
                    <text x="15" y="79" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">100</text>
                    <text x="15" y="124" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">50</text>
                    <text x="20" y="164" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">0</text>

                    {/* Area fill */}
                    <path
                      d="M 45,160 L 45,120 L 147,95 L 249,130 L 352,65 L 454,80 L 557,45 L 660,25 L 660,160 Z"
                      fill="url(#chartGrad)"
                    />

                    {/* Glowing Chart Line */}
                    <path
                      d="M 45,120 L 147,95 L 249,130 L 352,65 L 454,80 L 557,45 L 660,25"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      filter="url(#glow)"
                    />

                    {/* Dot plot */}
                    {[
                      { x: 45, y: 120, val: 62 },
                      { x: 147, y: 95, val: 88 },
                      { x: 249, y: 130, val: 54 },
                      { x: 352, y: 65, val: 118 },
                      { x: 454, y: 80, val: 97 },
                      { x: 557, y: 45, val: 142 },
                      { x: 660, y: 25, val: 165 },
                    ].map((pt, pIdx) => (
                      <g key={pIdx} className="group">
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1" />
                        <text
                          x={pt.x}
                          y={pt.y - 12}
                          fill="#06b6d4"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          {pt.val}
                        </text>
                      </g>
                    ))}

                    {/* X Axis labels */}
                    {[
                      { x: 45, label: 'MON' },
                      { x: 147, label: 'TUE' },
                      { x: 249, label: 'WED' },
                      { x: 352, label: 'THU' },
                      { x: 454, label: 'FRI' },
                      { x: 557, label: 'SAT' },
                      { x: 660, label: 'SUN' },
                    ].map((lbl, lIdx) => (
                      <text
                        key={lIdx}
                        x={lbl.x}
                        y="184"
                        fill="rgba(255,255,255,0.3)"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {lbl.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Main row: Recent activity & quick stats */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Unified Recent Activity Logs */}
                <div className="lg:col-span-8 glass-premium p-8 rounded-3xl space-y-6">
                  <h3 className="text-xl font-bold font-grotesk">Recent Database Activity</h3>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div
                        key={activity.title}
                        className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            activity.type === 'project'
                              ? 'bg-purple-500/10 text-purple-400'
                              : activity.type === 'skill'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-pink-500/10 text-pink-400'
                          }`}
                        >
                          {activity.type.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate text-white">{activity.title}</div>
                          <div className="text-xs font-mono text-white/30 my-0.5">{activity.detail}</div>
                        </div>
                        <span className="text-[10px] text-white/40 shrink-0 font-mono">
                          {new Date(activity.time).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {stats.recentActivity.length === 0 && (
                      <div className="text-center text-white/30 py-8 text-sm">
                        No activity recorded. Add some projects or skills to start.
                      </div>
                    )}
                  </div>
                </div>

                {/* Database Info & Health */}
                <div className="lg:col-span-4 glass-premium p-8 rounded-3xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold font-grotesk">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-white/40">DBMS URL</span>
                        <span className="font-mono text-xs text-white/80">MySQL/Localhost</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-white/40">Prisma Client</span>
                        <span className="font-mono text-xs text-green-400">ACTIVE v6.9.0</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pb-2">
                        <span className="text-white/40">Files uploads</span>
                        <span className="font-mono text-xs text-cyan-400">Multer Storage</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs leading-relaxed">
                    ✨ <strong>Pro-Tip:</strong> Any changes made across these sections will update your database instantly
                    and render dynamically on the portfolio landing page!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. HERO CMS TAB ==================== */}
          {activeTab === 'hero' && heroData && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Hero Section Settings</h1>
                <p className="text-white/40 text-sm">Design the dynamic entrance banner and 3D visual parameters.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Form Editor */}
                <form onSubmit={saveHero} className="xl:col-span-7 glass-premium p-8 rounded-3xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">DISPLAY NAME *</label>
                      <input
                        type="text"
                        value={heroData.name}
                        onChange={e => setHeroData({ ...heroData, name: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">SUBTITLE / STATUS *</label>
                      <input
                        type="text"
                        value={heroData.subtitle}
                        onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">GRADIENT TITLE HEADER *</label>
                    <input
                      type="text"
                      value={heroData.title}
                      onChange={e => setHeroData({ ...heroData, title: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">HERO BIOGRAPHY DESCRIPTION *</label>
                    <textarea
                      rows={4}
                      value={heroData.description}
                      onChange={e => setHeroData({ ...heroData, description: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">BUTTONS (JSON ARRAY CONFIG)</label>
                      <textarea
                        rows={3}
                        value={heroData.buttons}
                        onChange={e => setHeroData({ ...heroData, buttons: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">SIDEBAR SOCIALS (JSON CONFIG)</label>
                      <textarea
                        rows={3}
                        value={heroData.socialLinks}
                        onChange={e => setHeroData({ ...heroData, socialLinks: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">AVATAR PROFILE PHOTO URL</label>
                      <input
                        type="text"
                        value={heroData.profileImage || ''}
                        onChange={e => setHeroData({ ...heroData, profileImage: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">3D RENDER CONFIG (JSON)</label>
                      <input
                        type="text"
                        value={heroData.settings3D || ''}
                        onChange={e => setHeroData({ ...heroData, settings3D: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2">
                      {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Hero Section'}
                    </button>
                  </div>
                </form>

                {/* Simulated Desktop Preview */}
                <div className="xl:col-span-5 space-y-6">
                  <div className="glass-premium p-6 rounded-3xl border border-white/5">
                    <h3 className="text-lg font-bold font-grotesk mb-4">Simulated Landing Preview</h3>

                    <div className="w-full h-80 rounded-2xl bg-[#04040e] border border-white/10 relative overflow-hidden flex flex-col p-6 text-left justify-center">
                      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-mono text-purple-300 w-fit mb-3">
                        <Sparkles size={8} /> {heroData.subtitle.toUpperCase()}
                      </div>

                      <h2 className="text-xl font-bold font-grotesk text-white leading-tight mb-2">
                        Engineering <span className="text-cyan-400">Intelligent</span> Experiences.
                      </h2>
                      <p className="text-[10px] text-white/40 line-clamp-3 mb-4 leading-normal">{heroData.description}</p>

                      <div className="flex gap-2">
                        <div className="px-4 py-1.5 rounded-full bg-white text-black text-[9px] font-bold">Explore My Work</div>
                        <div className="px-4 py-1.5 rounded-full border border-white/15 text-white text-[9px]">Contact</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. ABOUT CMS TAB ==================== */}
          {activeTab === 'about' && aboutData && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">About Section CMS</h1>
                <p className="text-white/40 text-sm">Edit your achievements stat cards, highlighted bullets, and background biography.</p>
              </div>

              <form onSubmit={saveAbout} className="glass-premium p-8 rounded-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">ABOUT SECTION TITLE *</label>
                    <input
                      type="text"
                      value={aboutData.title}
                      onChange={e => setAboutData({ ...aboutData, title: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">AVATAR BIO PHOTO URL</label>
                    <input
                      type="text"
                      value={aboutData.profileImage || ''}
                      onChange={e => setAboutData({ ...aboutData, profileImage: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">SUMMARY DESCRIPTION *</label>
                  <textarea
                    rows={3}
                    value={aboutData.description}
                    onChange={e => setAboutData({ ...aboutData, description: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">DETAILED BIOGRAPHY MARKDOWN *</label>
                  <textarea
                    rows={6}
                    value={aboutData.personalBio}
                    onChange={e => setAboutData({ ...aboutData, personalBio: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">STATS CARDS (JSON CONFIG)</label>
                    <textarea
                      rows={4}
                      value={aboutData.statsCards}
                      onChange={e => setAboutData({ ...aboutData, statsCards: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">HIGHLIGHT BULLETS (JSON ARRAY)</label>
                    <textarea
                      rows={4}
                      value={aboutData.highlights}
                      onChange={e => setAboutData({ ...aboutData, highlights: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save About Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== 4. SKILLS CMS TAB ==================== */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Skills Inventory</h1>
                  <p className="text-white/40 text-sm">Add, remove, drag, and sort your technical expertise dynamically.</p>
                </div>
                <button onClick={() => openSkillModal()} className="btn-primary py-2.5 px-5 rounded-xl flex items-center gap-2">
                  <Plus size={16} /> New Skill
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {['Languages', 'Frameworks', 'Tools', 'Databases', 'AI/ML', 'DevOps'].map(cat => {
                  const catSkills = skills.filter(
  (s) =>
    (s.category || '').toLowerCase() ===
    (cat || '').toLowerCase()
)
                  return (
                    <div key={cat} className="glass-premium p-6 rounded-3xl space-y-4">
                      <h3 className="text-lg font-bold font-grotesk text-cyan-400 border-b border-white/5 pb-2 flex justify-between">
                        <span>{cat}</span>
                        <span className="font-mono text-xs text-white/30 font-medium">({catSkills.length})</span>
                      </h3>

                      <div className="space-y-3">
                        {catSkills.map(s => {
                          const globalIdx = skills.findIndex(item => item.id === s.id)
                          return (
                            <div
                              key={s.id}
                              className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-2xl p-4 gap-4"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate text-sm">{s.name}</div>
                                <div className="text-xs font-mono text-white/40 mt-1 flex items-center gap-2">
                                  <span>Level: {s.level}%</span>
                                  <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: `${s.level}%` }} />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => reorderCollection('skills', globalIdx, 'up')}
                                  disabled={globalIdx === 0}
                                  className="p-2 text-white/30 hover:text-white disabled:opacity-20"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  onClick={() => reorderCollection('skills', globalIdx, 'down')}
                                  disabled={globalIdx === skills.length - 1}
                                  className="p-2 text-white/30 hover:text-white disabled:opacity-20"
                                >
                                  <ArrowDown size={14} />
                                </button>
                                <button
                                  onClick={() => openSkillModal(s)}
                                  className="p-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteSkill(s.id)}
                                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                        {catSkills.length === 0 && (
                          <div className="text-center py-6 text-white/20 text-xs font-mono">
                            NO SKILLS LISTED IN {cat.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ==================== 5. PROJECTS CMS TAB ==================== */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Projects Repository</h1>
                  <p className="text-white/40 text-sm">Fully compile, order, feature, and edit details of portfolio projects.</p>
                </div>
                <button onClick={() => openProjectModal()} className="btn-primary py-2.5 px-5 rounded-xl flex items-center gap-2">
                  <Plus size={16} /> Add Project
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {projects.map((p, idx) => (
                  <div
                    key={p.id}
                    className="glass-premium p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex gap-4 items-center flex-1 w-full min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-white truncate">{p.title}</h3>
                          {p.featured && (
                            <span className="text-[9px] font-mono font-black text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full tracking-wider uppercase">
                              FEATURED
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/15">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-sm text-white/50 line-clamp-1 mt-1">{p.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => reorderCollection('projects', idx, 'up')}
                        disabled={idx === 0}
                        className="p-2 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => reorderCollection('projects', idx, 'down')}
                        disabled={idx === projects.length - 1}
                        className="p-2 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => openProjectModal(p)}
                        className="btn-secondary py-2 px-4 rounded-xl flex items-center gap-1.5"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-20 text-white/30 glass rounded-3xl border border-dashed border-white/10">
                    No projects yet. Click "Add Project" to get started!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 6. EXPERIENCE TIMELINE TAB ==================== */}
          {activeTab === 'experience' && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Experiences Timeline</h1>
                  <p className="text-white/40 text-sm">
                    Add, remove, and reorder career benchmarks in your dynamic resume timeline.
                  </p>
                </div>
                <button onClick={() => openExperienceModal()} className="btn-primary py-2.5 px-5 rounded-xl flex items-center gap-2">
                  <Plus size={16} /> New Experience
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="glass-premium p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-cyan-400">{exp.duration}</span>
                        <h3 className="font-extrabold text-xl text-white">{exp.roleTitle}</h3>
                        <span className="text-sm text-white/50">@ {exp.organization}</span>
                      </div>
                      <p className="text-sm text-white/40 line-clamp-2 mt-2 leading-relaxed">{exp.description}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(() => {
                          let techArr: string[] = []
                          try {
                            techArr = JSON.parse(exp.technologies)
                          } catch {
                            techArr = exp.technologies.split(',')
                          }
                          return techArr.map(t => (
                            <span
                              key={t}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/5"
                            >
                              {t}
                            </span>
                          ))
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => reorderCollection('experiences', idx, 'up')}
                        disabled={idx === 0}
                        className="p-2 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => reorderCollection('experiences', idx, 'down')}
                        disabled={idx === experiences.length - 1}
                        className="p-2 text-white/30 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => openExperienceModal(exp)}
                        className="btn-secondary py-2 px-4 rounded-xl flex items-center gap-1.5"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => deleteExperience(exp.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && (
                  <div className="text-center py-20 text-white/30 glass rounded-3xl border border-dashed border-white/10">
                    No career timeline benchmarks yet. Click "New Experience" to write one!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 7. CONTACT & INBOX TAB ==================== */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Inbox & Contact CMS</h1>
                <p className="text-white/40 text-sm">
                  Read incoming client inquiries and update your portfolio call-to-action details.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* CTA Form Settings */}
                <form onSubmit={saveSettings} className="xl:col-span-4 glass-premium p-6 rounded-3xl space-y-4 h-fit">
                  <h3 className="text-lg font-bold font-grotesk mb-4 text-cyan-400">CTA & Coordinates</h3>

                  {settings && (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-white/50 mb-1.5">CONTACT EMAIL</label>
                        <input
                          type="email"
                          value={settings.contactEmail || ''}
                          onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-white/50 mb-1.5">CONTACT PHONE</label>
                        <input
                          type="text"
                          value={settings.contactPhone || ''}
                          onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-white/50 mb-1.5">GEOLOCATION</label>
                        <input
                          type="text"
                          value={settings.contactLocation || ''}
                          onChange={e => setSettings({ ...settings, contactLocation: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-white/50 mb-1.5">CTA HEADING TEXT</label>
                        <textarea
                          rows={3}
                          value={settings.contactCTA || ''}
                          onChange={e => setSettings({ ...settings, contactCTA: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary w-full py-2.5 rounded-lg flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Save Coordinates'}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                {/* Inbox Messages list */}
                <div className="xl:col-span-8 glass-premium p-8 rounded-3xl space-y-6">
                  <h3 className="text-xl font-bold font-grotesk flex justify-between items-center">
                    <span>Client Inquiries</span>
                    <span className="font-mono text-xs text-white/40">({messages.length} total)</span>
                  </h3>

                  <div className="space-y-4">
                    {messages.map(m => (
                      <div
                        key={m.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          m.isRead
                            ? 'bg-white/[0.01] border-white/5'
                            : 'bg-purple-500/[0.03] border-purple-500/20 shadow-lg shadow-purple-500/5'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-base">{m.name}</span>
                              {!m.isRead && (
                                <span className="text-[9px] font-mono font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 tracking-wider">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-cyan-400 mt-0.5 block">{m.email}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toggleMessageRead(m.id)}
                              className={`p-2 rounded-xl transition-all ${
                                m.isRead
                                  ? 'text-white/30 hover:text-white hover:bg-white/5'
                                  : 'text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20'
                              }`}
                              title={m.isRead ? 'Mark as Unread' : 'Mark as Read'}
                            >
                              {m.isRead ? <Eye size={14} /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => deleteMessage(m.id)}
                              className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                        <span className="text-[10px] text-white/30 font-mono block mt-4">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center text-white/20 py-20 text-sm">
                        No client messages in database yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 8. RESUME FILE MANAGEMENT TAB ==================== */}
          {activeTab === 'resume' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Resume Upload Settings</h1>
                <p className="text-white/40 text-sm">Upload, version, and set active PDF resumes dynamically.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Uploader Card */}
                <form onSubmit={handlePdfUploadSubmit} className="lg:col-span-5 glass-premium p-6 rounded-3xl space-y-4 h-fit">
                  <h3 className="text-lg font-bold font-grotesk mb-4 text-amber-400">Upload New PDF</h3>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">VERSION STAMP (e.g. v2.1) *</label>
                    <input
                      type="text"
                      value={resumeVersion}
                      onChange={e => setResumeVersion(e.target.value)}
                      required
                      placeholder="v1.0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">PDF FILE *</label>
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/[0.01] transition-all relative">
                      <input
                        type="file"
                        id="resume-file-input"
                        accept="application/pdf"
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload size={32} className="mx-auto mb-2 text-white/30" />
                      <span className="text-xs text-white/50 block font-mono">CHOOSE PDF FILE</span>
                      <span className="text-[10px] text-white/30 block mt-1">MAX SIZE: 5MB</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingPdf}
                    className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    {uploadingPdf ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : 'Upload & Set Active'}
                  </button>
                </form>

                {/* Versions History */}
                <div className="lg:col-span-7 glass-premium p-8 rounded-3xl space-y-6">
                  <h3 className="text-xl font-bold font-grotesk">Uploaded Resume History</h3>

                  <div className="space-y-4">
                    {resumes.map(r => (
                      <div
                        key={r.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 bg-white/[0.01] ${
                          r.isActive ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-white/5'
                        }`}
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              r.isActive ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/30'
                            }`}
                          >
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-base">Resume {r.version || 'Stamp'}</span>
                              {r.isActive && (
                                <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 tracking-wider">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <a
                              href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${r.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white/40 hover:text-white transition-colors truncate block max-w-sm mt-0.5 font-mono"
                            >
                              {r.fileUrl}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!r.isActive && (
                            <button
                              onClick={() => setResumeActive(r.id)}
                              className="btn-secondary py-1.5 px-3 rounded-lg text-xs font-bold text-amber-400 hover:bg-amber-500/10 border-amber-500/10"
                            >
                              Set Active
                            </button>
                          )}
                          <button
                            onClick={() => deleteResume(r.id)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {resumes.length === 0 && (
                      <div className="text-center text-white/20 py-16 text-sm font-mono">
                        NO UPLOADED RESUME VERSIONS IN DATABASE.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 9. SOCIAL PROFILES TAB ==================== */}
          {activeTab === 'socials' && socialLinks && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Social Profiles CMS</h1>
                <p className="text-white/40 text-sm">Configure all media platforms and developer hubs dynamically.</p>
              </div>

              <form onSubmit={saveSocialLinks} className="glass-premium p-8 rounded-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">GITHUB URL</label>
                    <input
                      type="url"
                      value={socialLinks.github || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">LINKEDIN URL</label>
                    <input
                      type="url"
                      value={socialLinks.linkedin || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">TWITTER / X URL</label>
                    <input
                      type="url"
                      value={socialLinks.twitter || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">INSTAGRAM URL</label>
                    <input
                      type="url"
                      value={socialLinks.instagram || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">LEETCODE PROFILE</label>
                    <input
                      type="url"
                      value={socialLinks.leetcode || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, leetcode: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://leetcode.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">CODEFORCES URL</label>
                    <input
                      type="url"
                      value={socialLinks.codeforces || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, codeforces: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://codeforces.com/profile/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">PORTFOLIO URL</label>
                    <input
                      type="url"
                      value={socialLinks.portfolio || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">YOUTUBE CHANNEL</label>
                    <input
                      type="url"
                      value={socialLinks.youtube || ''}
                      onChange={e => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Social links'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== 10. GLOBAL SETUP TAB ==================== */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black font-grotesk tracking-tight mb-2">Global Settings & SEO</h1>
                <p className="text-white/40 text-sm">
                  Fine-tune core theme aesthetics, custom cursors, and OpenGraph indexing tags.
                </p>
              </div>

              <form onSubmit={saveSettings} className="glass-premium p-8 rounded-3xl space-y-6">
                <h3 className="text-lg font-bold font-grotesk text-cyan-400 border-b border-white/5 pb-2">
                  Visual Theme & Brand Setup
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 glass p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                  <div className="space-y-4">
                    <span className="text-xs font-mono text-cyan-400/80 block uppercase tracking-widest font-bold">
                      Theme Color Presets
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Cyber Cyan / Purple', primary: '#06b6d4', secondary: '#8b5cf6' },
                        { label: 'Synthwave Pink / Yellow', primary: '#ec4899', secondary: '#eab308' },
                        { label: 'Matrix Emerald / Teal', primary: '#10b981', secondary: '#14b8a6' },
                        { label: 'Solar Orange / Rose', primary: '#f97316', secondary: '#f43f5e' },
                      ].map((preset, pIdx) => {
                        const isCurrent = getThemeValue('primary', '#8b5cf6') === preset.primary
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              updateThemeValue('primary', preset.primary)
                              updateThemeValue('secondary', preset.secondary)
                              showToast(`Applied Preset: ${preset.label}`, 'success')
                            }}
                            className={`px-3 py-2 rounded-xl text-[11px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: preset.primary }} />
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block -ml-1"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono text-white/50 mb-1">
                        <span>ORB GLOW INTENSITY</span>
                        <span className="text-cyan-400 font-bold">
                          {Math.round((getThemeValue('glowIntensity', 1.0) as number) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.1"
                        value={getThemeValue('glowIntensity', 1.0) as number}
                        onChange={e => updateThemeValue('glowIntensity', parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 accent-cyan-400 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-mono text-white/50 mb-1">
                        <span>PARTICLE DENSITY MATRIX</span>
                        <span className="text-purple-400 font-bold">
                          {getThemeValue('particleCount', 2000) as number} PTS
                        </span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="5000"
                        step="250"
                        value={getThemeValue('particleCount', 2000) as number}
                        onChange={e => updateThemeValue('particleCount', parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-white/10 accent-purple-500 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">NAVBAR LOGO / TEXT BRAND</label>
                    <input
                      type="text"
                      value={settings.logoText || ''}
                      onChange={e => setSettings({ ...settings, logoText: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">THEME COLORS CONFIG (JSON STRING)</label>
                    <input
                      type="text"
                      value={settings.themeColors}
                      onChange={e => setSettings({ ...settings, themeColors: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white/40 focus:outline-none focus:border-purple-500"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm block">Custom Interactive Cursor</span>
                      <span className="text-xs text-white/40 block mt-0.5">Toggle holographic mouse cursor.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.customCursor}
                      onChange={e => setSettings({ ...settings, customCursor: e.target.checked })}
                      className="w-5 h-5 accent-purple-500 rounded"
                    />
                  </div>

                  <div className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm block">3D Canvas Particles</span>
                      <span className="text-xs text-white/40 block mt-0.5">Enable background particle system.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.particleEffects}
                      onChange={e => setSettings({ ...settings, particleEffects: e.target.checked })}
                      className="w-5 h-5 accent-purple-500 rounded"
                    />
                  </div>
                </div>

                {/* SEO Configurations */}
                <h3 className="text-lg font-bold font-grotesk text-purple-400 border-b border-white/5 pb-2 pt-4">
                  SEO & Search Engine Indexing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">SEO HEADER TITLE</label>
                    <input
                      type="text"
                      value={settings.seoTitle || ''}
                      onChange={e => setSettings({ ...settings, seoTitle: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">FAVICON ICON PATH</label>
                    <input
                      type="text"
                      value={settings.favicon || ''}
                      onChange={e => setSettings({ ...settings, favicon: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">SEO KEYWORDS (Comma separated)</label>
                  <input
                    type="text"
                    value={settings.seoKeywords || ''}
                    onChange={e => setSettings({ ...settings, seoKeywords: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">META ROBOT DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={settings.seoDescription || ''}
                    onChange={e => setSettings({ ...settings, seoDescription: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Global Setup'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ==================== CMS DIALOG OVERLAYS (MODALS) ==================== */}

      {/* 1. PROJECT CRUD MODAL */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-[#0a0a1a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-2xl font-bold font-grotesk text-white">
                  {editingProjectId ? 'Modify Project' : 'New Portfolio Project'}
                </h2>
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-2 text-white/50 hover:text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="cms-project-form" onSubmit={handleProjectSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">CATEGORY *</label>
                      <select
                        value={projectForm.category}
                        onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Web" className="bg-[#0a0a1a]">Web Application</option>
                        <option value="Mobile" className="bg-[#0a0a1a]">Mobile Development</option>
                        <option value="AI/ML" className="bg-[#0a0a1a]">AI / Machine Learning</option>
                        <option value="Game" className="bg-[#0a0a1a]">Game Build</option>
                        <option value="Systems" className="bg-[#0a0a1a]">Systems Infrastructure</option>
                      </select>
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm block">Featured Project</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">
                          Prioritizes listing at the top of landing section.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={projectForm.featured}
                        onChange={e => setProjectForm({ ...projectForm, featured: e.target.checked })}
                        className="w-5 h-5 accent-purple-500 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 h-40 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {projectForm.image ? (
                        <img
                          src={projectForm.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={e => (e.currentTarget.src = '')}
                        />
                      ) : (
                        <div className="text-center text-white/20">
                          <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                          <span className="text-[10px] font-mono">THUMB PREVIEW</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-xs font-mono text-white/50 mb-2">IMAGE / THUMBNAIL URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={projectForm.image}
                            onChange={e => setProjectForm({ ...projectForm, image: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                            placeholder="https://..."
                          />
                          <div className="relative shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async e => {
                                const url = await handleGenericFileUpload(e, 'project')
                                if (url) setProjectForm({ ...projectForm, image: url })
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <button type="button" className="btn-secondary h-full px-4 rounded-xl flex items-center gap-1.5">
                              <Upload size={14} /> Upload
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-white/50 mb-2">TITLE *</label>
                        <input
                          type="text"
                          value={projectForm.title}
                          onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                          placeholder="Project Title"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">SUMMARY DESCRIPTION *</label>
                    <textarea
                      value={projectForm.description}
                      onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                      required
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Short description for landing card..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">
                      MULTIPLE SCREENSHOTS (Comma-separated URLs)
                    </label>
                    <input
                      type="text"
                      value={projectForm.screenshots}
                      onChange={e => setProjectForm({ ...projectForm, screenshots: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="url1, url2, url3"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">GITHUB CODE URL</label>
                      <input
                        type="url"
                        value={projectForm.githubUrl}
                        onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">LIVE DEMO URL</label>
                      <input
                        type="url"
                        value={projectForm.liveUrl}
                        onChange={e => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">
                      TECH STACK TAGS * (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={projectForm.techStack}
                      onChange={e => setProjectForm({ ...projectForm, techStack: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="React, Node.js, Prisma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">DETAILED CASE STUDY (MARKDOWN)</label>
                    <textarea
                      value={projectForm.markdownDescription}
                      onChange={e => setProjectForm({ ...projectForm, markdownDescription: e.target.value })}
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 font-mono resize-none"
                      placeholder="# Deep Dive &#10; Write project case study..."
                    />
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="cms-project-form"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                >
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Project'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SKILL CRUD MODAL */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#0a0a1a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-2xl font-bold font-grotesk text-white">
                  {editingSkillId ? 'Edit Skill Details' : 'Compile New Skill'}
                </h2>
                <button
                  onClick={() => setIsSkillModalOpen(false)}
                  className="p-2 text-white/50 hover:text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form id="cms-skill-form" onSubmit={handleSkillSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">CATEGORY *</label>
                  <select
                    value={skillForm.category}
                    onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Languages" className="bg-[#0a0a1a]">Programming Language</option>
                    <option value="Frameworks" className="bg-[#0a0a1a]">Framework / Library</option>
                    <option value="Tools" className="bg-[#0a0a1a]">Developer Tool / Utility</option>
                    <option value="Databases" className="bg-[#0a0a1a]">Database Engine</option>
                    <option value="AI/ML" className="bg-[#0a0a1a]">AI / Machine Learning</option>
                    <option value="DevOps" className="bg-[#0a0a1a]">DevOps & Cloud Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">SKILL NAME *</label>
                  <input
                    type="text"
                    value={skillForm.name}
                    onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. TypeScript"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">ICON CODE / URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillForm.icon}
                      onChange={e => setSkillForm({ ...skillForm, icon: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://..."
                    />
                    <div className="relative shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          const url = await handleGenericFileUpload(e, 'skill')
                          if (url) setSkillForm({ ...skillForm, icon: url })
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button type="button" className="btn-secondary h-full px-4 rounded-xl flex items-center gap-1.5">
                        <Upload size={14} /> Upload
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-white/50 mb-2">
                    <span>PROFICIENCY LEVEL</span>
                    <span className="text-cyan-400 font-bold">{skillForm.level}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={skillForm.level}
                    onChange={e => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500 h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </form>

              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="cms-skill-form"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                >
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Skill'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. EXPERIENCE Timeline CRUD MODAL */}
      <AnimatePresence>
        {isExperienceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#0a0a1a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-2xl font-bold font-grotesk text-white">
                  {editingExperienceId ? 'Edit Career Benchmark' : 'Log Timeline Experience'}
                </h2>
                <button
                  onClick={() => setIsExperienceModalOpen(false)}
                  className="p-2 text-white/50 hover:text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="cms-experience-form" onSubmit={handleExperienceSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">ROLE TITLE *</label>
                      <input
                        type="text"
                        value={experienceForm.roleTitle}
                        onChange={e => setExperienceForm({ ...experienceForm, roleTitle: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Lead HPC Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">ORGANIZATION / FIRM *</label>
                      <input
                        type="text"
                        value={experienceForm.organization}
                        onChange={e => setExperienceForm({ ...experienceForm, organization: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Google DeepMind"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">DURATION *</label>
                      <input
                        type="text"
                        value={experienceForm.duration}
                        onChange={e => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g. 2024 - PRESENT"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">ICON SHAPE KEY (LUCIDE)</label>
                      <input
                        type="text"
                        value={experienceForm.icon}
                        onChange={e => setExperienceForm({ ...experienceForm, icon: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g. Briefcase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">BIO WORK SUMMARY *</label>
                    <textarea
                      value={experienceForm.description}
                      onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })}
                      required
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Brief details of your achievements..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">
                      TECHNOLOGIES DEPLOYED * (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={experienceForm.technologies}
                      onChange={e => setExperienceForm({ ...experienceForm, technologies: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                      placeholder="C++, CUDA, Docker, Kubernetes"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsExperienceModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="cms-experience-form"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                >
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Experience'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}