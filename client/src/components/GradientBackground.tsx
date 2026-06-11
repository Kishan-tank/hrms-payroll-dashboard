import type { ReactNode } from 'react';

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export default function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div
      className={`min-h-screen bg-[radial-gradient(ellipse_at_50%_0%,#dbeafe_0%,#eff6ff_28%,#f8fafc_58%,#f0fdf4_100%)] ${className}`}
    >
      {children}
    </div>
  );
}
