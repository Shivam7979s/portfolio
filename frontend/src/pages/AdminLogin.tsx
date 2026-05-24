import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { authService } from '../services/auth.service'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return // Prevent duplicate requests
    
    setLoading(true)
    setError('')
    
    console.log("LOGIN REQUEST PAYLOAD:", { email, password })

    try {
      const res = await authService.login(email, password)
      console.log("LOGIN SUCCESS RESPONSE:", res.data)
      
      const { token, success, user } = res.data
      
      if (success && token) {
        console.log("TOKEN RECEIVED:", token)
        console.log("USER RECEIVED:", user)
        localStorage.setItem('token', token)
        navigate('/admin/dashboard')
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err: any) {
      console.error("LOGIN ERROR RESPONSE:", err.response?.data || err)
      setError(err.response?.data?.error || 'Server error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020208]">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] bg-gradient-to-tr from-purple-600 to-cyan-500 pointer-events-none" />
      <div className="noise" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 px-6"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-2xl shadow-purple-900/20 relative">
          
          {/* Premium Animated Toast Notification */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-[90%] glass-premium border border-red-500/30 bg-red-500/10 text-red-400 text-sm py-3 px-4 rounded-xl flex items-center gap-3 shadow-[0_10px_30px_rgba(239,68,68,0.2)] z-50 backdrop-blur-xl"
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mb-8 pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold font-grotesk text-white">Admin Access</h2>
            <p className="text-white/40 text-sm mt-2 font-light">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 tracking-widest">EMAIL</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 tracking-widest">PASSWORD</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 25px rgba(139, 92, 246, 0.5)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full btn-primary py-4 mt-4 flex justify-center items-center gap-2 relative overflow-hidden transition-all disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 size={18} className="animate-spin" /> Authenticating...
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  Sign In <ArrowRight size={18} />
                </motion.div>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
