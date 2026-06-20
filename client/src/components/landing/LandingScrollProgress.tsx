import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('Hero');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
      setIsVisible(totalScroll > 100); // Show after scrolling down a bit

      // Detect active section
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = 'Hero';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Check if section is well within the viewport (top is above middle of screen)
        if (rect.top <= window.innerHeight / 2) {
          const id = section.getAttribute('data-section');
          if (id) {
            currentSection = id;
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] hidden sm:flex items-center gap-2 lg:gap-3 xl:gap-3.5 rounded-full border border-white/10 bg-[#0B1121]/90 p-1.5 lg:p-1.5 lg:pr-5 xl:p-2 xl:pr-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300"
        >
          {/* Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0 h-9 w-9 lg:h-10 lg:w-10 xl:h-12 xl:w-12 transition-all duration-300">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 52 52">
              {/* Background */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-slate-800"
              />
              {/* Animated Foreground */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                fill="none"
                stroke="url(#landingProgressGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
              <defs>
                <linearGradient id="landingProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />    {/* Blue */}
                  <stop offset="50%" stopColor="#06b6d4" />   {/* Cyan */}
                  <stop offset="100%" stopColor="#a855f7" />  {/* Purple */}
                </linearGradient>
              </defs>
            </svg>
            
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8.5px] lg:text-[9px] xl:text-[10px] font-bold text-white tracking-tighter transition-all duration-300">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Text Labels */}
          <div className="hidden lg:flex flex-col justify-center gap-0.5">
            <span className="text-[8px] xl:text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500 transition-all duration-300">
              Page Progress
            </span>
            <span className="text-xs xl:text-sm font-bold text-slate-200 tracking-wide transition-all duration-300">
              {activeSection}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
