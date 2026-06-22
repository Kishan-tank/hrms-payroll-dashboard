import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0B1121]">
      <div className="relative flex flex-col items-center gap-6">
        {/* Glowing background orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 rounded-full border border-blue-500/10 border-t-blue-500/30 border-r-blue-500/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 rounded-full border border-indigo-500/10 border-b-indigo-500/30 border-l-indigo-500/20"
        />

        {/* Core pulsing logo placeholder */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-white/5">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl"
          />
          <svg
            className="relative h-10 w-10 text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" />
          </svg>
        </div>

        {/* Premium indeterminate loader bar */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
