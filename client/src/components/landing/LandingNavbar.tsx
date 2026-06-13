import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function BuildingIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" />
    </svg>
  );
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Enterprise', href: '#enterprise' },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    const sections = ['features', 'product', 'pricing', 'enterprise'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-slate-950/70 border-b border-blue-500/10 shadow-[0_8px_30px_rgba(15,23,42,0.35)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/40 transition group-hover:shadow-blue-500/60">
            <BuildingIcon />
          </span>
          <span className="text-lg font-bold text-white">
            HRMS<span className="text-blue-400">Pro</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="ml-8 hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = activeSection && link.href === `#${activeSection}`;
            return (
              <a
                key={link.label}
                href={link.href}
                className={`group relative py-2 text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
                {/* Underline animation */}
                <span 
                  className={`absolute bottom-1.5 left-0 h-[2px] rounded-full bg-blue-500 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} 
                />
              </a>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="relative overflow-hidden rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="border-t border-white/8 px-6 py-4 lg:hidden"
          style={{ background: 'rgba(2,8,23,0.98)', backdropFilter: 'blur(24px)' }}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-300"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                onClick={() => setMobileOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
