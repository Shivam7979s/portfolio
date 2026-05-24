// src/components/layouts/ResponsiveNavbar.tsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../../services/sound.service';

interface ResponsiveNavbarProps {
  navLinks: { label: string; href: string }[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMuted: boolean;
  toggleMute: () => void;
  resumeUrl: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ResponsiveNavbar({
  navLinks,
  activeSection,
  setActiveSection,
  isMuted,
  toggleMute,
  resumeUrl,
  isOpen,
  setIsOpen,
}: ResponsiveNavbarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden p-2 z-50 relative text-white/70 hover:text-white transition-colors"
        onClick={() => {
          soundService.playClick();
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Full-Screen Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden p-6"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => soundService.playHover()}
                  onClick={() => {
                    soundService.playClick();
                    setActiveSection(link.href.substring(1));
                    setIsOpen(false);
                  }}
                  className={`text-3xl font-bold transition-all duration-300 ${
                    isActive
                      ? 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                      : 'text-white hover:text-purple-200'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
              {/* Mobile Sound Toggle */}
              <button
                onClick={() => {
                  toggleMute();
                  soundService.playClick();
                }}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                {isMuted ? 'Unmute Sounds' : 'Mute Sounds'}
              </button>

              {/* Resume Link */}
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => soundService.playHover()}
                onClick={() => {
                  soundService.playClick();
                  setIsOpen(false);
                }}
                className="w-full text-center text-lg font-semibold px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-500/20"
              >
                View Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
