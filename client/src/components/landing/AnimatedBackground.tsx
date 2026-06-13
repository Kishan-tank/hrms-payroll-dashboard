export default function AnimatedBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020817 0%, #0a0f1e 40%, #050d1a 70%, #020817 100%)' }}
    >
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blue glow — top left */}
      <div
        className="animate-blob pointer-events-none absolute -left-40 -top-40 h-[700px] w-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Purple glow — top right */}
      <div
        className="animate-blob2 animation-delay-2000 pointer-events-none absolute -right-40 top-20 h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, rgba(124,58,237,0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Cyan accent — bottom center */}
      <div
        className="animate-blob animation-delay-4000 pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
