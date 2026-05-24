// src/components/layouts/LoadingScreen.tsx
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundService } from '../../services/sound.service'

const BOOT_LOGS = [
  { text: "SYSTEM BOOT PROTOCOL v4.5.2", type: "system" },
  { text: "CORE // ARCHITECT: SHIVAM SINGH", type: "info" },
  { text: "──────────────────────────────────────────────────", type: "divider" },
  { text: "⚡ INITIALIZING SYSTEM DIAGNOSTICS...", type: "process" },
  { text: "✔️ HARDWARE RESOLUTION CHECK: HIGH-DPI ACCELERATION", type: "success" },
  { text: "✔️ BROWSER ENGINE: WEB AUDIO + WEBGL 2.0 CONFIRMED", type: "success" },
  { text: "⚡ ESTABLISHING SECURE GATEWAY TO PORTFOLIO SERVER...", type: "process" },
  { text: "✔️ API ROUTING HANDSHAKE ESTABLISHED [PORT 5000]", type: "success" },
  { text: "✔️ DATABASE INTEGRITY COMPATIBLE [MYSQL + PRISMA]", type: "success" },
  { text: "⚡ PARSING DYNAMIC GLSL SHADER LIBRARIES...", type: "process" },
  { text: "✔️ COMPILED 3D ORB NOISE DISTORTION SHADER MATRIX", type: "success" },
  { text: "✔️ CAMERA PARALLAX RIG CONFIGURATION CONFIGURED", type: "success" },
  { text: "⚡ GENERATING CYBERPUNK AURORA ENVIRONMENT LAYERS...", type: "process" },
  { text: "✔️ CHROMATIC STYLING INITIALIZED", type: "success" },
  { text: "──────────────────────────────────────────────────", type: "divider" },
  { text: "BOOT STATUS: READY. EXECUTE MAIN SYSTEM?", type: "system" },
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userActionVisible, setUserActionVisible] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [isDone, setIsDone] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when logs update
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, typedInput]);

  // Sequential log printing
  useEffect(() => {
    if (currentIndex < BOOT_LOGS.length) {
      const log = BOOT_LOGS[currentIndex];
      let delay = 150 + Math.random() * 200;
      if (log.type === 'process') delay = 400;
      if (log.type === 'divider') delay = 50;
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, log.text]);
        soundService.playHover();
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setUserActionVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Typing prompt simulation
  useEffect(() => {
    if (!userActionVisible) return;
    const fullCommand = " Y";
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < fullCommand.length) {
        const char = fullCommand[charIndex] ?? '';
        setTypedInput(prev => prev + char);
        soundService.playHover();
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          soundService.playBootBeep();
          setIsDone(true);
          setTimeout(onComplete, 800);
        }, 600);
      }
    }, 250);
    return () => clearInterval(typingInterval);
  }, [userActionVisible, onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020208] text-white p-6 font-mono select-none"
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)', transition: { duration: 0.6, ease: 'easeIn' } }}
        >
          {/* Glitch overlay */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85))] pointer-events-none" />
          {/* CRT scanlines */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
          {/* Cinematic glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-[150px] pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, #06b6d4 100%)' }} />
          {/* HUD frame */}
          <div className="w-full max-w-2xl relative z-10 glass rounded-2xl border border-white/5 shadow-2xl p-6 md:p-8 flex flex-col h-[400px] overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 text-[10px] text-white/40 tracking-[0.2em] uppercase">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-2">TERMINAL // SYSTEM_BOOT.LOG</span>
              </div>
              <div className="animate-pulse">ONLINE</div>
            </div>
            {/* Console area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 text-xs md:text-sm custom-scrollbar text-white/80">
              {logs.map((log, idx) => {
                let color = 'text-white/60';
                if (log.startsWith('✔️')) color = 'text-cyan-400';
                if (log.startsWith('⚡')) color = 'text-purple-400';
                if (log.startsWith('CORE') || log.startsWith('SYSTEM BOOT')) color = 'text-pink-400 font-bold';
                if (log.includes('READY')) color = 'text-green-400 font-black animate-pulse';
                return (
                  <div key={idx} className={`${color} leading-relaxed break-all`}>{log}</div>
                );
              })}
              {userActionVisible && (
                <div className="text-green-400 font-black mt-4 flex items-center">
                  <span>&gt; RUN SHIVAM.EXE (Y/N):</span>
                  <span className="ml-1 text-white">{typedInput}</span>
                  <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-green-400 ml-1 inline-block" />
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
            {/* Footer */}
            <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[9px] text-white/30 tracking-widest font-mono">
              <div>CPU TEMP: 42°C</div>
              <div>ALLOCATED_MEM: 256MB</div>
              <div>BUILD_SYS: OK</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
